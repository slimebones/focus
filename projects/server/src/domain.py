from orwynn.mongo import Doc, DocField, Udto

from src.color import ColorPalette

class FocusDomainUdto(Udto):
    name: str
    timer_sids: list[str] = []

class FocusDomain(Doc):
    Fields = [DocField(name="name", unique=True)]
    name: str
    color_palette: ColorPalette
    timer_sids: list[str] = []

    def to_udto(self) -> FocusDomainUdto:
        return FocusDomainUdto(
                sid=self.sid,
                name=self.name,
                timer_sids=self.timer_sids)

