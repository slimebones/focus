import { ArrUtils } from "../jskit/arr";
import {
  CreateDocReq, DelDocReq, GetDocsReq, UpdDocReq
} from "./msg";
import { ClientBus, PubOpts } from "../rxcat";

export abstract class BusUtils
{
  public static pubGetDocsReq$<TRetUdto>(
    req: GetDocsReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto[]>
  {
    return ClientBus.ie.pub$(req, opts).pipe(
      map(rae => (rae.evt as any).udtos)
    );
  }

  public static pubGetDocReq$<TRetUdto>(
    req: GetDocsReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto>
  {
    return ClientBus.ie.pub$(req, opts).pipe(
      map(rae => ArrUtils.getOnlyFirstOrErr((rae.evt as any).udtos))
    );
  }

  public static pubCreateDocReq$<TRetUdto>(
    req: CreateDocReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto>
  {
    return ClientBus.ie.pub$(req, opts).pipe(
      map(rae => (rae.evt as any).udto)
    );
  }

  public static pubUpdDocReq$<TRetUdto>(
    req: UpdDocReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto>
  {
    return ClientBus.ie.pub$(
      req, opts
    ).pipe(map(rae => (rae.evt as any).udto));
  }

  public static pubDelDocReq$(
    req: DelDocReq,
    opts: PubOpts = {}
  ): Observable<void>
  {
    return ClientBus.ie.pub$(req, opts)
      .pipe(
        map(rae => { return; })
      );
  }
}
