import { writable } from "../jskit/store";
import { v4 as uuid } from "uuid";
import { asrt } from "../jskit/asrt";
import { log } from "../jskit/log";
import { AnyConstructor, code, FcodeCore } from "../jskit/fcode";
import { Queue } from "queue-typescript";
import { AlreadyProcessedErr, InpErr, NotFoundErr } from "../jskit/err";
import { Readable } from "$lib/jskit/store/public";

interface ReqAndRaction
{
  req: Req;
  raction: PubAction;
}

export class Msg
{
  public msid: string;

  public constructor(
    args?: any
  )
  {
    if (args?.msid === undefined)
    {
      this.msid = MsgUtils.genUuid();
      return;
    }
    this.msid = args.msid;
  }
}

export interface Rawmsg
{
  msid: string;
  mcodeid: number;
  rsid?: string;
}

export class Evt extends Msg
{
  public rsid: string | undefined;

  public constructor(
    args?: any
  )
  {
    super(args);
    this.rsid = args?.rsid;
  }
}

export class Req extends Msg
{
}

export interface ErrEvtArgs
{
  errmsg: string;
  isThrownByPubAction: boolean | undefined;
  err: Error;
}

@code("err-evt")
export class ErrEvt extends Evt
{
  public errcodeid: number | undefined;
  public errmsg: string;
  public isThrownByPubAction: boolean | undefined;

  /**
    * Since only server can throw err evts, client need to deserialize them
    * to an aux field, if they have an according err class registered for
    * this errcodeid.
    *
    * If client cannot find an according err, the base class is initialized
    * with errmsg.
    */
  public internal_err: Error;

  public constructor(
    args: ErrEvtArgs
  )
  {
    super(args);
    this.errmsg = args.errmsg;
    this.isThrownByPubAction = args.isThrownByPubAction;
    this.internal_err = args.err;
  }
}

export abstract class MsgUtils
{
  public static genUuid(): string
  {
    return uuid().replaceAll("-", "");
  }

  public static isMsg(obj: any): obj is Msg
  {
    return (
      "msid" in obj
      && "mcode" in obj
    );
  }

  public static isEvt(obj: any): obj is Evt
  {
    return this.isMsg(obj);
  }

  public static isReq(obj: any): obj is Req
  {
    return this.isMsg(obj);
  }

  public static serializeJson(msg: Msg, mcodeid: number): Rawmsg
  {
    const data: any = Object.assign({}, msg);

    // remove unecessary fields
    const keysToDel: string[] = [];
    Object.keys(data).forEach((k) =>
    {
      if (data[k] === undefined || data[k] === null)
      {
        keysToDel.push(k);
      }
    });

    for (const k in keysToDel)
    {
      delete data[k];
    }

    asrt("msid" in data);
    asrt(mcodeid >= 0);
    data["mcodeid"] = mcodeid;
    return data as Rawmsg;
  }

  public static deserializeJson(
    rawmsg: Rawmsg,
    indexedMcodes: string[][],
    indexedErrcodes: string[][]
  ): Msg
  {
    const allMcodes = indexedMcodes[rawmsg.mcodeid];
    const constructor = FcodeCore.ie.tryGetConstructorForAnyCodes(allMcodes);
    if (constructor === undefined)
    {
      throw new Error("no constructor for any of mcodes " + allMcodes);
    }

    const fdata: any = { ...rawmsg };
    if ("errcodeid" in fdata)
    {
      const allErrcodes = indexedErrcodes[fdata["errcodeid"]];
      const errConstructor = FcodeCore.ie.tryGetConstructorForAnyCodes(
        allErrcodes
      );

      const errmsg = fdata["errmsg"];
      let errf: Error = new Error(errmsg);
      if (errConstructor !== undefined)
      {
        errf = new errConstructor(errmsg);
      }
      fdata["err"] = errf;
    }

    if ("mcodeid" in fdata)
    {
      delete fdata["mcodeid"];
    }

    return new constructor(fdata);
  }
}

export interface ReqAndEvt<TReq = Req, TEvt = Evt>
{
  req: TReq;
  evt: TEvt;
}

export interface SubActionAndOpts
{
  action: SubAction;
  opts: SubOpts;
}
export type SubAction = (msg: Msg) => void;
export type PubAction = (req: Req, evt: Evt) => void;

export interface SubOpts
{
  isLastMsgSkipped?: boolean;
}

export interface PubOpts
{
  isNetSendSkipped?: boolean;
  isInnerSendSkipped?: boolean;
}

export type MsgType = any;

// todo: for now we simplify, and consider this bus only as a client one.
//       In future this should conform to uniform bus, but configured as client
//       one.
export class ClientBus
{
  private static _ie: ClientBus;

  public static get ie(): ClientBus
  {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return this._ie || (this._ie = new this());
  }

  private serverConn: WebSocket;

  private nextSubId: number = 0;
  private subidToMcode: { [key: number]: string } = {};
  private subidToSubActionAndOpts: { [key: number]: SubActionAndOpts } = {};
  private mcodeToLastMsg: { [key: string]: Msg } = {};

  private indexedMcodes: string[][] = [];
  private indexedErrcodes: string[][] = [];
  private isInitdEvtReceived: boolean = false;
  private isInitd: boolean = false;
  private execWhenInitdEvtReceived: Queue<() => void> =
    new Queue<() => void>();

  private rsidToReqAndAction: { [rsid: string]: ReqAndRaction } = {};

  private constructor()
  {
  }

  public init(
    serverHost: string,
    serverPort: number
  ): void
  {
    if (this.isInitd)
    {
      return;
    }

    this.serverConn = new WebSocket(
      "ws://"
      + serverHost
      + ":"
      + serverPort
      + "/rx"
    );

    this.serverConn.addEventListener(
      "open",
      (_) =>
      {
        log.info("opened conn");
      }
    );
    this.serverConn.addEventListener(
      "message",
      (evt) =>
      {
        const data = JSON.parse(evt.data);
        this.receiveConnRawmsg.call(this, data);
      }
    );
    this.serverConn.addEventListener(
      "close",
      (_) =>
      {
        this.receiveConnComplete.call(this);
      }
    );

    this.isInitd = true;
  }

  public sub(
    constructor: AnyConstructor,
    action: SubAction,
    opts: SubOpts = {} as SubOpts
  ): number
  {
    const mcode = FcodeCore.ie.tryGetActiveCodeForConstructor(constructor);
    if (mcode === undefined)
    {
      throw new NotFoundErr(constructor);
    }

    const subid = this.nextSubId;
    this.nextSubId++;

    asrt(!(subid in this.subidToMcode));
    asrt(!(subid in this.subidToSubActionAndOpts));
    this.subidToMcode[subid] = mcode;
    this.subidToSubActionAndOpts[subid] = { action: action, opts: opts };

    if (opts.isLastMsgSkipped === true)
    {
      const lastMsg = this.mcodeToLastMsg[mcode];
      if (lastMsg !== undefined)
      {
        this.tryInvokeAction(action, lastMsg);
      }
    }

    return subid;
  }

  public unsub(subid: number): boolean
  {
    if (!(subid in this.subidToMcode))
    {
      throw new NotFoundErr(subid);
    }

    asrt(subid in this.subidToSubActionAndOpts);

    delete this.subidToMcode[subid];
    delete this.subidToSubActionAndOpts[subid];
    return true;
  }

  public st_pub<TReq = Req, TEvt = Evt>(
    req: TReq,
    opts: PubOpts = {} as PubOpts
  ): Readable<ReqAndEvt<TReq, TEvt> | null>
  {
    const st = writable<ReqAndEvt<TReq, TEvt> | null>(null);

    const pubfn = (req: TReq, evt: TEvt) =>
    {
      const rae = { req: req, evt: evt };

      if (evt instanceof ErrEvt)
      {
        // todo: spawn alert here, as soon as it gets implementation for svelte
        throw evt.internal_err;
      }

      st.set(rae);
    };

    this.pub(
      req as Msg,
      ((req: TReq, evt: TEvt) => pubfn(req, evt)) as PubAction,
      opts
    );
    return st;
  }

  public pub(
    msg: Msg,
    pubaction: PubAction | undefined = undefined,
    opts: PubOpts = {} as PubOpts
  ): void
  {
    if (!this.isInitdEvtReceived)
    {
      this.execWhenInitdEvtReceived.enqueue(
        () => this.pub(msg, pubaction, opts)
      );
      return;
    }
    if (!(msg instanceof Req) && pubaction !== undefined)
    {
      throw new InpErr("non-req msg and defined raction");
    }

    // RESOLVE MCODE
    const currentMcode = FcodeCore.ie.tryGetActiveCodeForConstructor(
      Object.getPrototypeOf(msg).constructor
    );
    if (currentMcode === undefined)
    {
      throw new NotFoundErr("mcode for constructor");
    }
    const mcodeid = this.indexedMcodes.findIndex(
      (codes: string[]) => codes.includes(currentMcode)
    );
    if (mcodeid < 0)
    {
      const err = Error(
        `mcode ${currentMcode} is found locally,`
        + " but does not exist in remote"
      );
      log.catch(err);
      return;
    }

    // RESOLVE PUBACTION
    if (msg instanceof Req && pubaction !== undefined)
    {
      if (msg.msid in this.rsidToReqAndAction)
      {
        throw new AlreadyProcessedErr(msg.msid);
      }
      this.rsidToReqAndAction[msg.msid] = { req: msg, raction: pubaction };
    }

    // SEND ORDER
    //    1. Net
    //    2. Inner
    //    3. As response

    // send to net
    if (opts.isNetSendSkipped !== true)
    {
      const serializedMsg = MsgUtils.serializeJson(
        msg,
        mcodeid
      );
      const serializedMsgStr = JSON.stringify(serializedMsg);
      log.info("send: " +  serializedMsgStr);
      this.serverConn.send(serializedMsgStr);
    }

    // send to inner
    if (opts.isInnerSendSkipped !== true)
    {
      for (const [subid, existingMcode] of Object.entries(this.subidToMcode))
      {
        if (currentMcode == existingMcode)
        {
          // if any action fails this is out of responsibility of this pub
          // method - so just continue
          this.tryInvokeAction(
            this.subidToSubActionAndOpts[Number.parseInt(subid)].action,
            msg
          );
        }
      }
    }

    // send as response
    if (msg instanceof Evt && msg.rsid !== undefined)
    {
      this.sendAsResponse(msg);
    }
  }

  private sendAsResponse(evt: Evt): void
  {
    if (evt.rsid === undefined)
    {
      return;
    }

    const reqAndRaction = this.rsidToReqAndAction[evt.rsid];
    if (reqAndRaction === undefined)
    {
      return;
    }
    delete this.rsidToReqAndAction[evt.rsid];

    this.tryInvokeRaction(reqAndRaction.raction, reqAndRaction.req, evt);
  }

  private tryInvokeAction(action: SubAction, msg: Msg): boolean
  {
    try
    {
      action(msg);
    }
    catch (err)
    {
      log.catch(err as Error);
      return false;
    }

    return true;
  }

  private tryInvokeRaction(action: PubAction, req: Req, evt: Evt): boolean
  {
    try
    {
      action(req, evt);
    }
    catch (err)
    {
      log.catch(err as Error);
      return false;
    }

    return true;
  }

  private receiveConnRawmsg(rawmsg: Rawmsg): void
  {
    log.info("receive: " +  JSON.stringify(rawmsg));

    if (!("msid" in rawmsg))
    {
      return;
    }

    if (!this.isInitdEvtReceived)
    {
      const initdMsg = rawmsg as any;
      const indexedMcodes = initdMsg["indexedMcodes"];
      const indexedErrcodes = initdMsg["indexedErrcodes"];

      if (indexedMcodes === undefined || indexedErrcodes === undefined)
      {
        log.catch(new Error(
          "expected initd msg, got " + JSON.stringify(initdMsg)
        ));
        return;
      }

      this.indexedMcodes = indexedMcodes;
      this.indexedErrcodes = indexedErrcodes;
      this.isInitdEvtReceived = true;
      while (this.execWhenInitdEvtReceived.length > 0)
      {
        this.execWhenInitdEvtReceived.dequeue()();
      }
      return;
    }

    const msg = MsgUtils.deserializeJson(
      rawmsg, this.indexedMcodes, this.indexedErrcodes
    );
    if (msg instanceof ErrEvt && msg.internal_err === undefined)
    {
      // create generic err for unhandled err codes
      msg.internal_err = Error(msg.errmsg);
    }
    this.pub(msg, undefined, { isNetSendSkipped: true });
  }

  private receiveConnErr(err: any): void
  {
    log.err("conn err: " + err);
  }

  private receiveConnComplete(): void
  {
    log.info("client bus conn closed");
  }
}
