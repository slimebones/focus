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
from pykit.err import AlreadyProcessedErr, InpErr
from pykit.history import History
from rxcat import Evt, OkEvt, Req

TimerPurpose = Literal["work", "rest", "play"]
TimerStatus = Literal["tick", "paused", "finished"]

class TimerUdto(Udto):
    purpose: TimerPurpose
    currentDuration: float
    totalDuration: float
    finishSoundAssetSid: str | None
    status: TimerStatus

class TimerDoc(Doc):
    purpose: TimerPurpose
    currentDuration: float = 0.0
    """
    This is written only on status change. Clients should calc it themselves
    and verify on timer changes.
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
        await self._sub(GetDocsReq, self._on_get_docs)
        await self._sub(CreateDocReq, self._on_create_doc)
        await self._sub(UpdDocReq, self._on_upd_doc)
        await self._sub(DelDocReq, self._on_del_doc)
        await self._sub(StartTimerReq, self._on_start_timer)
        await self._sub(StopTimerReq, self._on_stop_timer)

    async def _tick_timer(
        self,
        current_duration: float,
        total_duration: float
    ):
        pass

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
        timer_doc = timer_doc.upd(Query.as_upd(set=setq))
        await self._pub(timer_doc.to_got_doc_udto_evt(req))

    async def _on_stop_timer(self, req: StopTimerReq):
        timer_doc = TimerDoc.get(Query({"sid": req.sid}))
        if timer_doc.status != "tick":
            raise InpErr(
                f"on timer with status {timer_doc.status}, an attempt to stop"
            )

        setq: dict[str, Any] = {
            "status": "paused"
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
        doc = TimerDoc.get_and_upd(req.searchQuery, req.updQuery)
        await self._pub(doc.to_got_doc_udto_evt(req))

    async def _on_del_doc(self, req: DelDocReq):
        TimerDoc.get_and_del(req.searchQuery)
        await self._pub(OkEvt(rsid="").as_res_from_req(req))

