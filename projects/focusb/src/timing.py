import asyncio
from typing import Any, Literal
from fcode import code

from orwynn.dto import Udto
from pykit.dt import DtUtils
from orwynn.mongo import (
    CreateDocReq,
    DelDocReq,
    Doc,
    GetDocsReq,
    Query,
    UpdDocReq,
    filter_collection_factory,
)
from orwynn.sys import Sys
from pykit.err import AlreadyProcessedErr, InpErr, LockErr, ValErr
from pykit.history import History
from rxcat import Evt, OkEvt, Req

TimerPurpose = Literal["work", "rest", "play"]
TimerStatus = Literal["tick", "paused", "finished"]

class TimerUdto(Udto):
    purpose: TimerPurpose
    currentDuration: float
    totalDuration: float
    launchedLastTickTimestamp: float
    finishSoundAssetSid: str | None
    status: TimerStatus

class TimerDoc(Doc):
    purpose: TimerPurpose
    currentDuration: float = 0.0
    """
    This is written only on status change. Clients should calc it themselves
    and verify on timer changes.
    """
    launchedLastTickTimestamp: float = 0.0
    """
    When last tick status was assigned to a timer.

    It's helpful to measure how long from the currentDuration the timer is
    ticking.
    """
    totalDuration: float
    status: TimerStatus = "paused"

    finishSoundAssetSid: str | None = None

    def to_udto(self) -> TimerUdto:
        return TimerUdto(
            sid=self.sid,
            purpose=self.purpose,
            currentDuration=self.currentDuration,
            totalDuration=self.totalDuration,
            launchedLastTickTimestamp=self.launchedLastTickTimestamp,
            finishSoundAssetSid=self.finishSoundAssetSid,
            status=self.status
        )

@code("start-timer-req")
class StartTimerReq(Req):
    sid: str

@code("stop-timer-req")
class StopTimerReq(Req):
    sid: str

@code("finished-timer-evt")
class FinishedTimerEvt(Evt):
    udto: TimerUdto

class TimingSys(Sys):
    CommonSubMsgFilters = [
        filter_collection_factory(TimerDoc.get_collection())
    ]

    async def enable(self):
        self._timer_sid_to_tick_task: dict[str, asyncio.Task] = {}

        await self._sub(GetDocsReq, self._on_get_docs)
        await self._sub(CreateDocReq, self._on_create_doc)
        await self._sub(UpdDocReq, self._on_upd_doc)
        await self._sub(DelDocReq, self._on_del_doc)
        await self._sub(StartTimerReq, self._on_start_timer)
        await self._sub(StopTimerReq, self._on_stop_timer)

    def _create_tick_task_for_timer(self, timer_doc: TimerDoc):
        if timer_doc.sid in self._timer_sid_to_tick_task:
            raise AlreadyProcessedErr(f"tick task for timer {timer_doc}")
        self._timer_sid_to_tick_task[timer_doc.sid] = asyncio.create_task(
            self._tick_timer(
                timer_doc.sid,
                timer_doc.currentDuration,
                timer_doc.totalDuration
            )
        )

    def _try_stop_tick_task_for_timer(self, sid: str) -> bool:
        task = self._timer_sid_to_tick_task.get(sid, None)
        if not task:
            return False
        task.cancel()
        return True

    def _stop_all_timers(self):
        for sid, task in self._timer_sid_to_tick_task.items():
            task.cancel()
            self._finish_timer(sid)

    def _finish_timer(self, sid: str):
        timer_doc = TimerDoc.get(Query({"sid": sid}))
        if timer_doc.status != "tick":
            raise ValErr(
                f"timer status must be \"tick\", got {timer_doc.status}"
            )

        timer_doc.upd(Query.as_upd(
            set={
                "status": "finished",
                "currentDuration": 0.0
            }
        ))

    async def _tick_timer(
        self,
        sid: str,
        current_duration: float,
        total_duration: float
    ):
        delta_duration = total_duration - current_duration
        if delta_duration > 0:
            await asyncio.sleep(delta_duration)
        self._finish_timer(sid)

    async def _on_start_timer(self, req: StartTimerReq):
        timer_doc = TimerDoc.get(Query({"sid": req.sid}))
        if timer_doc.status == "tick":
            raise AlreadyProcessedErr(f"timer {timer_doc} start")

        setq: dict[str, Any] = {
            "status": "tick"
        }
        # restart ticked duration upon starting a finished timer again
        if timer_doc.status == "finished":
            setq["tickedDuration"] = 0.0

        # it's ok here to pass not upded yet timer doc, an err may happen here,
        # so we don't want to upd the mongo doc before this point
        self._create_tick_task_for_timer(timer_doc)
        setq["launchedLastTickTimestamp"] = DtUtils.get_utc_timestamp()

        timer_doc = timer_doc.upd(Query.as_upd(set=setq))
        await self._pub(timer_doc.to_got_doc_udto_evt(req))

    async def _on_stop_timer(self, req: StopTimerReq):
        timer_doc = TimerDoc.get(Query({"sid": req.sid}))
        if timer_doc.status != "tick":
            raise InpErr(
                f"on timer with status {timer_doc.status}, an attempt to stop"
            )
        self._try_stop_tick_task_for_timer(timer_doc.sid)

        now_timestamp = DtUtils.get_utc_timestamp()
        assert timer_doc.launchedLastTickTimestamp > 0.0
        passed_delta = now_timestamp - timer_doc.launchedLastTickTimestamp
        new_current_duration = timer_doc.currentDuration + passed_delta
        assert new_current_duration < timer_doc.totalDuration

        setq: dict[str, Any] = {
            "status": "paused",
            "currentDuration": new_current_duration
        }
        timer_doc = timer_doc.upd(Query.as_upd(set=setq))
        await self._pub(timer_doc.to_got_doc_udto_evt(req))

    async def _on_get_docs(self, req: GetDocsReq):
        docs = list(TimerDoc.get_many(req.searchQuery))
        await self._pub(TimerDoc.to_got_doc_udtos_evt(req, docs))

    async def _on_create_doc(self, req: CreateDocReq):
        q = req.createQuery.copy().disallow(
            "status",
            raise_mod="warn"
        )
        doc = TimerDoc(**q).create()
        await self._pub(doc.to_got_doc_udto_evt(req))

    async def _on_upd_doc(self, req: UpdDocReq):
        updq = req.updQuery.copy().disallow(
            "currentDuration",
            "status",
            raise_mod="warn"
        )
        doc = TimerDoc.get(req.searchQuery)
        if doc.status == "tick":
            raise LockErr(f"cannot do any changes on ticking timer {doc}")
        doc = doc.upd(updq)
        await self._pub(doc.to_got_doc_udto_evt(req))

    async def _on_del_doc(self, req: DelDocReq):
        doc = TimerDoc.get(req.searchQuery)
        if doc.status == "tick":
            raise LockErr(f"cannot do any changes on ticking timer {doc}")
        doc = doc.delete()
        await self._pub(OkEvt(rsid="").as_res_from_req(req))

