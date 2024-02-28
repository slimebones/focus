from typing import Literal
from orwynn.dto import Fdto, Udto
from orwynn.mongo import (
    CreateDocReq,
    DelDocReq,
    Doc,
    GetDocsReq,
    GotDocUdtoEvt,
    UpdDocReq,
    filter_collection_factory,
)
from orwynn.sys import Sys
from rxcat import OkEvt, ServerBus

TimerPurpose = Literal["work", "rest", "play"]
TimerStatus = Literal["wait", "tick", "paused", "finished"]

class TimerUdto(Udto):
    purpose: TimerPurpose
    duration: float
    finishSoundAssetSid: str | None
    status: TimerStatus

class TimerDoc(Doc):
    purpose: TimerPurpose
    duration: float

    finishSoundAssetSid: str | None = None 
    status: TimerStatus = "wait"

    def to_udto(self) -> TimerUdto:
        return TimerUdto(
            sid=self.sid,
            purpose=self.purpose,
            duration=self.duration,
            finishSoundAssetSid=self.finishSoundAssetSid,
            status=self.status
        )

class TimingSys(Sys):
    CommonSubMsgFilters = [
        filter_collection_factory(TimerDoc.get_collection())
    ]

    async def enable(self):
        await self._sub(GetDocsReq, self._on_get_docs)
        await self._sub(CreateDocReq, self._on_create_doc)
        await self._sub(UpdDocReq, self._on_upd_doc)
        await self._sub(DelDocReq, self._on_del_doc)

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

