declare module 'feather-icons' {
  export interface Icon {
    toSvg(attrs?: Record<string, string>): string
  }

  export interface Icons {
    [key: string]: Icon
  }

  export const icons: Icons
}

