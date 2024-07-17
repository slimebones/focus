#pragma once
#include <functional>
#include "../ckit/uuid.h"

namespace Rxcat
{
	class Msg
	{
	public:
		std::string msid = Ckit::make_uuid4();
	};

	class Evt : public Msg
	{
	public:
		std::string rsid;
		bool* is_thrown_by_pubfn = nullptr;
	};

	class Req : public Msg
	{
	};

	class OkEvt : public Evt
	{
	};

	class ErrEvt : public Evt
	{
	public:
		std::exception inner__err;
		std::string errmsg;
		std::string errtype;
		std::string stacktrace;
	};

	class ClientBus
	{
	private:
		template<class TReq, class TEvt>
		using Pubfn = std::function<void(TReq, TEvt)>;
		template<class TMsg>
		using Subfn = std::function<void(TMsg)>;

		struct ReqAndPubfn
		{
		public:
			Req req;
			Pubfn<Req, Evt> pubfn;
		};
	};
}

