import { code } from "../jskit/fcode";
import { Query } from "../jskit/mongo";
import { Evt, Req } from "../rxcat";

@code("ok-evt")
export class OkEvt extends Evt
{
}

// tmp unused at backend
// @code("get-doc-req")
// export class GetDocReq extends Req
// {
//   public collection: string;
//   public searchQuery: string;

//   public constructor(
//     args: any
//   )
//   {
//     super(args);
//     this.collection = args.collection;
//     this.searchQuery = args.searchQuery;
//   }
// }

@code("get-docs-req")
export class GetDocsReq extends Req
{
  public collection: string;
  public searchQuery: Query;

  public constructor(
    args: any
  )
  {
    super(args);
    this.collection = args.collection;
    this.searchQuery = args.searchQuery;
  }
}

export interface CreateDocReqArgs
{
  collection: string;
  createQuery: Query;
}

@code("create-doc-req")
export class CreateDocReq extends Req
{
  public collection: string;
  public createQuery: Query;

  public constructor(
    args: CreateDocReqArgs
  )
  {
    super(args);
    this.collection = args.collection;
    this.createQuery = args.createQuery;
  }
}

export interface UpdDocReqArgs
{
  collection: string;
  searchQuery: Query;
  updQuery: Query;
}

@code("upd-doc-req")
export class UpdDocReq extends Req
{
  public collection: string;
  public searchQuery: Query;
  public updQuery: Query;

  public constructor(args: UpdDocReqArgs)
  {
    super(args);
    this.collection = args.collection;
    this.searchQuery = args.searchQuery;
    this.updQuery = args.updQuery;
  }
}

export interface GotDocUdtoEvtArgs
{
  collection: string;
  udto: any;
}

@code("got-doc-udto-evt")
export class GotDocUdtoEvt<TUdto> extends Evt
{
  public collection: string;
  public udto: TUdto;

  public constructor(
    args: GotDocUdtoEvtArgs
  )
  {
    super(args);
    this.collection = args.collection;
    this.udto = args.udto;
  }
}

@code("got-doc-udtos-evt")
export class GotDocUdtosEvt<TUdto> extends Evt
{
  public collection: string;
  public udtos: TUdto[];

  public constructor(
    args: any
  )
  {
    super(args);
    this.collection = args.collection;
    this.udtos = args.udtos;
  }
}

@code("del-doc-req")
export class DelDocReq extends Req
{
  public collection: string;
  public searchQuery: Query;

  public constructor(
    args: any
  )
  {
    super(args);
    this.collection = args.collection;
    this.searchQuery = args.searchQuery;
  }
}
