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


class IdeaUdto(Udto):
    text: str
    isProcessed: bool

class IdeaDoc(Doc):
    text: str
    isProcessed: bool = False

    def to_udto(self) -> IdeaUdto:
        return IdeaUdto(
            sid=self.sid,
            text=self.text,
            isProcessed=self.isProcessed
        )

class IdeaSys(Sys):
    CommonSubMsgFilters = [
        filter_collection_factory(IdeaDoc.get_collection())
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

