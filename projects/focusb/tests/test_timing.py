import pytest
from orwynn.mongo import DelDocReq
from pykit.check import check
from rxcat import ServerBus

from src.timing import OkEvt, Query, TimerDoc, TimerUdto


@pytest.mark.asyncio
async def test_create_timer(timer_udto_1: TimerUdto):
    assert timer_udto_1.purpose == "work"
    assert timer_udto_1.finishSoundAssetSid is None
    assert timer_udto_1.status == "paused"
    assert timer_udto_1.launchedLastTickTimestamp == 0.0
    assert timer_udto_1.currentDuration == 0.0
    assert timer_udto_1.totalDuration == 2.0

@pytest.mark.asyncio
async def test_del_timer(timer_udto_1: TimerUdto, server_bus: ServerBus):
    evt = await server_bus.pubr(DelDocReq(
        collection="timerDoc",
        searchQuery=Query(sid=timer_udto_1.sid)
    ))
    check.instance(evt, OkEvt)
    assert len(list(TimerDoc.get_many())) == 0

