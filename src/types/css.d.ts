import "react";

declare module "react" {
  interface CSSProperties {
    /** Variables CSS personalizadas, ej. style={{ "--d": 2 }}. */
    [key: `--${string}`]: string | number | undefined;
  }
}
