import { Box } from '@mui/material'
import { keyframes } from '@emotion/react'
import { styled } from '@mui/material/styles'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RotatingSvg = styled('svg')`
  animation: ${rotate} 2s linear infinite;
`

const ArcPath = styled('path')<{ delay: number }>`
  fill: none;
  stroke-linecap: round;
  stroke-width: 3;
  stroke: #e0e0e0;
`

export const Loader = () => {
  // Calculate the SVG paths for the arc segments
  const createArcPath = (startAngle: number, endAngle: number) => {
    const radius = 18
    const center = 22

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    // Calculate start and end points
    const startX = center + radius * Math.cos(startRad)
    const startY = center + radius * Math.sin(startRad)
    const endX = center + radius * Math.cos(endRad)
    const endY = center + radius * Math.sin(endRad)

    // Create the arc flag (large arc = 0, sweep = 1)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
  }

  // Create three evenly spaced segments with gaps
  const segment1 = createArcPath(0, 60)
  const segment2 = createArcPath(120, 180)
  const segment3 = createArcPath(240, 300)

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'background.default',
        display: 'flex',
        height: '44px',
        justifyContent: 'center',
        transform: 'scale(1.3)',
        width: '44px'
      }}
    >
      <RotatingSvg width="44" height="44" viewBox="0 0 44 44">
        {/* Background circle (track) */}
        <circle cx="22" cy="22" r="18" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" fill="none" />

        {/* Segment arcs */}
        <ArcPath d={segment1} delay={0} />
        <ArcPath d={segment2} delay={0} />
        <ArcPath d={segment3} delay={0} />
      </RotatingSvg>
    </Box>
  )
}
