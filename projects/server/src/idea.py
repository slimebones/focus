from orwynn.dto import Udto
from orwynn.mongo import (
    CreateDocReq,
    DelDocReq,
    Doc,
    GetDocsReq,
    UpdDocReq,
    filter_collection_factory,
)
from orwynn.sys import Sys
from rxcat import OkEvt


class IdeaUdto(Udto):
    text: str
    is_processed: bool
    last_process_time: float

class IdeaDoc(Doc):
    text: str
    is_processed: bool = False
    last_process_time: float = 0.0

    def to_udto(self) -> IdeaUdto:
        return IdeaUdto(
            sid=self.sid,
            text=self.text,
            is_processed=self.is_processed,
            last_process_time=self.last_process_time
        )

class IdeaSys(Sys):
    CommonSubMsgFilters = [
        filter_collection_factory(IdeaDoc)
    ]

    async def enable(self):
        await self._sub(GetDocsReq, self._on_get_docs)
        await self._sub(CreateDocReq, self._on_create_doc)
        await self._sub(UpdDocReq, self._on_upd_doc)
        await self._sub(DelDocReq, self._on_del_doc)

    async def _on_get_docs(self, req: GetDocsReq):
        docs = list(IdeaDoc.get_many(req.searchQuery))
        await self._pub(IdeaDoc.to_got_doc_udtos_evt(req, docs))

    async def _on_create_doc(self, req: CreateDocReq):
        doc = IdeaDoc(**req.createQuery).create()
        await self._pub(doc.to_got_doc_udto_evt(req))

    async def _on_upd_doc(self, req: UpdDocReq):
        doc = IdeaDoc.get_and_upd(req.searchQuery, req.updQuery)
        await self._pub(doc.to_got_doc_udto_evt(req))

    async def _on_del_doc(self, req: DelDocReq):
        IdeaDoc.get_and_del(req.searchQuery)
        await self._pub(OkEvt(rsid="").as_res_from_req(req))

