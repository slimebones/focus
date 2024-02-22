import aiohttp.web
from orwynn.admin import handle_get_indexed_codes
from orwynn.auth import AuthCfg
from orwynn.boot import BootCfg
from orwynn.mongo import MongoCfg
from orwynn.preload import PreloadCfg, handle_preload
from orwynn.rbac import PermissionModel, RbacCfg

default = {
    "__default__": [
        BootCfg(
            std_verbosity=2,
            routedef_funcs=[
                lambda: aiohttp.web.post("/preload", handle_preload),
                lambda: aiohttp.web.get(
                    "/admin/codes",
                    handle_get_indexed_codes
                )
            ],
            bootscripts={
            }
        ),
        RbacCfg(
            permissions=[
                PermissionModel(
                    code="test-permission",
                    name="",
                    dscr=""
                ),
            ]
        ),
        AuthCfg(
            # check_user_func= \
            #     UserUtils.req_check_user,
            # try_login_user= \
            #     UserUtils.try_req_login_user,
            # try_logout_user= \
            #     UserUtils.try_req_logout_user,
            auth_token_secret="hello",  # noqa: S106
            auth_token_algo="HS256",  # noqa: S106
            auth_token_exp_time=2592000
        )
    ],
    "test": [
        MongoCfg(
            url="mongodb://localhost:9006",
            database_name="focusbTestDb",
            must_clean_db_on_destroy=True
        ),
        PreloadCfg(
            must_clean_preloads_on_destroy=True
        )
    ],
    "dev": [
        MongoCfg(
            url="mongodb://localhost:9006",
            database_name="focusbDevDb",
            must_clean_db_on_destroy=True
        )
    ],
    "prod": [
        MongoCfg(
            url="mongodb://mongo:27017",
            database_name="focusbProdDb"
        )
    ]
}
