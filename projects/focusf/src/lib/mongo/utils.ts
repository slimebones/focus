import { log } from "$lib/jskit/log";
import { Query } from "$lib/jskit/mongo";
import { ClientBus } from "$lib/rxcat";
import {
  CreateDocReq, DelDocReq, GetDocsReq, OkEvt, UpdDocReq
} from "$lib/rxcat/msg";

export abstract class MongoUtils
{
  public static get<T = any>(
    collection: string,
    searchq: Query,
    unsubs: (() => void)[],
    onval: (val: T) => void
  )
  {
    unsubs.push(ClientBus.ie.pubstf<T[]>(
      "udtos",
      new GetDocsReq({
        collection: collection,
        searchQuery: searchq
      })
    ).subscribe(val =>
    {
      if (val !== undefined)
      {
        if (val.length > 1)
        {
          log.err(
            "multiple elements returned for single doc search query"
            + " => pick first one, all elements: "
            + JSON.stringify(val)
          );
        }
        const fval = val[0];
        onval(fval);
      }
    }));
  }

  public static getMany<T = any>(
    collection: string,
    searchq: Query,
    unsubs: (() => void)[],
    onval: (val: T[]) => void
  )
  {
    unsubs.push(ClientBus.ie.pubstf<T[]>(
      "udtos",
      new GetDocsReq({
        collection: collection,
        searchQuery: searchq
      })
    ).subscribe(val =>
    {
      if (val !== undefined)
      {
        onval(val);
      }
    }));
  }

  public static create<T = any>(
    collection: string,
    createq: Query,
    unsubs: (() => void)[],
    onval: (val: T) => void
  )
  {
    unsubs.push(
      ClientBus.ie.pubstf<T>(
        "udto",
        new CreateDocReq({
          collection: collection,
          createQuery: createq
        })
      ).subscribe(val =>
        {
          if (val !== undefined)
          {
            onval(val);
          }
        })
    );
  }

  public static upd<T = any>(
    collection: string,
    searchq: Query,
    updq: Query,
    unsubs: (() => void)[],
    onval: (val: T) => void
  )
  {
    unsubs.push(ClientBus.ie.pubst<T>(
      new UpdDocReq({
        collection: collection,
        searchQuery: searchq,
        updQuery: updq
      })
    ).subscribe(val =>
    {
      if (val !== undefined)
      {
        onval(val);
      }
    }));
  }

  public static updBySid<T = any>(
    collection: string,
    sid: string,
    updq: Query,
    unsubs: (() => void)[],
    onval: (val: T) => void
  )
  {
    this.upd(collection, {sid: sid}, updq, unsubs, onval);
  }

  public static del(
    collection: string,
    searchq: Query,
    unsubs: (() => void)[],
    onval: () => void
  )
  {
    unsubs.push(ClientBus.ie.pubst<OkEvt>(
      new DelDocReq({
        collection: collection,
        searchQuery: searchq
      })
    ).subscribe(ok =>
    {
      if (ok !== undefined)
      {
        onval();
      }
    }));
  }

  public static delBySid(
    collection: string,
    sid: string,
    unsubs: (() => void)[],
    onval: () => void
  )
  {
    this.del(collection, {sid: sid}, unsubs, onval);
  }
}
