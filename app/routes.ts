import {type RouteConfig, index, route, layout} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    layout("routes/auth/layout.tsx", [
        route("register", "routes/auth/register.tsx"),
        route("register-success", "routes/auth/register-success.tsx"),
        route("verify/:token", "routes/auth/verify.tsx"),
        route("login", "routes/auth/login.tsx"),
        route("logout", "routes/auth/logout.tsx"),
        route("reset-password", "routes/auth/reset-password.tsx"),
        route("reset-password-success", "routes/auth/reset-password-success.tsx"),
    ]),

    route('account', 'routes/account/layout.tsx', [
        index('routes/account/index.tsx'),
        route('details', 'routes/account/details.tsx'),
        route('edit-profile', 'routes/account/edit-profile.tsx'),
        route('verify-email-change/:token', 'routes/account/verify-email-change.tsx'),
        route('change-password', 'routes/account/change-password.tsx'),
    ]),

    route('admin', 'routes/admin/layout.tsx', [
        index('routes/admin/index.tsx'),
        route('users', 'routes/admin/user/layout.tsx', [
            index('routes/admin/user/users.tsx'),
            route(':userId', 'routes/admin/user/user.tsx'),
        ]),
        route('events', 'routes/admin/event/layout.tsx', [
            index('routes/admin/event/events.tsx'),
            route('add', 'routes/admin/event/add.tsx'),
            route(':eventSlug', 'routes/admin/event/view/layout.tsx', {id: 'event'},
                [
                    index('routes/admin/event/view/index.tsx'),
                    route('edit', 'routes/admin/event/view/edit.tsx')
                ],
            ),
        ])
    ])
] satisfies RouteConfig;
