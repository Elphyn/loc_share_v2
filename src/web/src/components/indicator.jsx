import { useWRTCContext } from "../contexts/useWRTCContext"


export function Indicator() {
  const { connectionState } = useWRTCContext()

  return (
    <div>Status: {connectionState}</div>
  )
}
