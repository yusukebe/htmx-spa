import 'hono'
import { Context, MiddlewareHandler } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import type { FC } from 'hono/jsx'
import { css, Style } from 'hono/css'

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>): Response
  }
}

const ROOT_ID = 'root'

export const Link: FC<{ href: string }> = ({ href, children }) => {
  const className = css`
    text-decoration: none;
    &:hover {
      cursor: pointer;
      color: #007bff;
      text-decoration: underline;
    }
    &:visited {
      color: #007bff;
    }
  `
  return (
    <a hx-target={`#${ROOT_ID}`} hx-ext="stream" hx-get={href} hx-push-url="true" class={className}>
      {children}
    </a>
  )
}

const MenuItem: FC = ({ children }) => {
  const className = css`
    padding: 10px 15px;
  `
  return <li class={className}>{children}</li>
}

const Menu: FC = ({ children }) => {
  const className = css`
    list-style: none;
    display: flex;
    padding: 0;
    margin: 0;
  `
  return <ul class={className}>{children}</ul>
}

export const createRenderer = (c: Context): MiddlewareHandler => {
  const isHtmxRequest = c.req.header('hx-request') !== undefined ? true : false
  return jsxRenderer(
    ({ children }) => {
      if (isHtmxRequest) {
        return <>{children}</>
      }
      return (
        <html>
          <head>
            <link href="/static/style.css" rel="stylesheet" />
            <Style />
            <script src="/static/htmx.min.js"></script>
            <script src="/static/stream.js"></script>
          </head>
          <body>
            <header>
              <Menu>
                <MenuItem>
                  <Link href="/">Top</Link>
                </MenuItem>
                <MenuItem>
                  <Link href="/about">About</Link>
                </MenuItem>
                <MenuItem>
                  <Link href="/shops">Shops</Link>
                </MenuItem>
              </Menu>
            </header>
            <div id={ROOT_ID}>{children}</div>
          </body>
        </html>
      )
    },
    {
      stream: true
    }
  )
}
