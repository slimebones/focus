import pytest
from rxcat import ServerBus
from src.timing import TimerUdto


@pytest.mark.asyncio
async def test_create_timer(timer_udto_1: TimerUdto):
    assert timer_udto_1.purpose == "work"
    assert timer_udto_1.finishSoundAssetSid == None
    assert timer_udto_1.status == "paused"
    assert timer_udto_1.launchedLastTickTimestamp == 0.0
    assert timer_udto_1.currentDuration == 0.0
    assert timer_udto_1.totalDuration == 2.0

