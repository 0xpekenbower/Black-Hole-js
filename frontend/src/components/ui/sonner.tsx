// "use client"

// import { useTheme } from "@/context/themeContext"
// // import { Toaster as Sonner, ToasterProps } from "sonner"

// const Toaster = ({ ...props }: ToasterProps) => {
//   const { theme } = useTheme()
//   // Map our theme context values to what sonner expects
//   const sonnerTheme = theme === 'dark' ? 'dark' : 'light'

//   return (
//     <Sonner
//       theme={sonnerTheme as ToasterProps["theme"]}
//       className="toaster group"
//       style={
//         {
//           "--normal-bg": "var(--popover)",
//           "--normal-text": "var(--popover-foreground)",
//           "--normal-border": "var(--border)",
//         } as React.CSSProperties
//       }
//       {...props}
//     />
//   )
// }

// export { Toaster }
