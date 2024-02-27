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


class ProjectUdto(Udto):
    name: str
    routeCardSids: list[str] = []

class ProjectDoc(Doc):
    name: str
    routeCardSids: list[str] = []

    def to_udto(self) -> ProjectUdto:
        return ProjectUdto(
            sid=self.sid,
            name=self.name,
            routeCardSids=self.routeCardSids
        )

class ProjectSys(Sys):
    CommonSubMsgFilters = [
        filter_collection_factory(ProjectDoc.get_collection())
    ]

    async def enable(self):
        await self._sub(GetDocsReq, self._on_get_docs)
        await self._sub(CreateDocReq, self._on_create_doc)
        await self._sub(UpdDocReq, self._on_upd_doc)
        await self._sub(DelDocReq, self._on_del_doc)

    async def _on_get_docs(self, req: GetDocsReq):
        docs = list(ProjectDoc.get_many(req.searchQuery))
        await self._pub(ProjectDoc.to_got_doc_udtos_evt(req, docs))

    async def _on_create_doc(self, req: CreateDocReq):
        doc = ProjectDoc(**req.createQuery).create()
        await self._pub(doc.to_got_doc_udto_evt(req))

    async def _on_upd_doc(self, req: UpdDocReq):
        doc = ProjectDoc.get_and_upd(req.searchQuery, req.updQuery)
        await self._pub(doc.to_got_doc_udto_evt(req))

    async def _on_del_doc(self, req: DelDocReq):
        ProjectDoc.get_and_del(req.searchQuery)
        await self._pub(OkEvt(rsid="").as_res_from_req(req))

class ProjectUtils:
    @classmethod
    async def req_create_project_udto(cls, create_query: dict) -> ProjectUdto:
        f = None

        async def on(_, evt: GotDocUdtoEvt[ProjectUdto]):
            nonlocal f
            f = evt.udto

        req = CreateDocReq(
            collection=ProjectDoc.get_collection(),
            createQuery=create_query
        )
        await ServerBus.ie().pub(req, on)

        assert f
        return f

