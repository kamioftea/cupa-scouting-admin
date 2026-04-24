import {Fragment, type ReactNode} from "react";

export function NlToBr({ children }: { children: string }): ReactNode {
  const lines = children.split(/\r\n|\r|\n/);

  return <>
    {lines.map((line, index) => (
      <Fragment key={index}>
        {index > 0 ? <br /> : null}
        {line}
      </Fragment>
    ))}
  </>
}
