import os

from pykit.check import check
import pytest_asyncio
from fcode import FcodeCore
from orwynn.app import App
from orwynn.boot import Boot
from orwynn.mongo import CreateDocReq, GotDocUdtoEvt, MongoUtils
from orwynn.tst import Client
from rxcat import ServerBus
from src.timing import TimerUdto

from pykit.query import Query


@pytest_asyncio.fixture(autouse=True)
async def autorun():
    os.environ["ORWYNN_MODE"] = "test"
    os.environ["ORWYNN_DEBUG"] = "1"
    os.environ["ORWYNN_ALLOW_CLEAN"] = "1"

    yield

    await Boot.ie().destroy()

    FcodeCore.deflock = False
    FcodeCore.clean_non_decorator_codes()
    await ServerBus.destroy()
    await MongoUtils.destroy()

    Boot.try_discard()
    ServerBus.try_discard()

@pytest_asyncio.fixture
async def app() -> App:
    app = await Boot.create_app()
    return app

@pytest_asyncio.fixture
async def client(app: App, aiohttp_client):
    return Client(await aiohttp_client(app))

@pytest_asyncio.fixture
async def server_bus(app) -> ServerBus:
    return ServerBus.ie()

@pytest_asyncio.fixture
async def timer_udto_1(server_bus: ServerBus) -> TimerUdto:
    evt = await server_bus.pubr(CreateDocReq(
        collection="timerDoc",
        createQuery=Query(
            purpose="work",
            totalDuration=2.0
        )
    ))
    evt = check.instance(evt, GotDocUdtoEvt)
    udto = check.instance(evt.udto, TimerUdto)
    return udto

