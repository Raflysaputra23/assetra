import React from 'react'

const Skeleton = ({ width, height }: {width?: string, height?: string}) => {
  return <div className={`${width ? width : 'w-full'} ${height ? height : 'h-full'} bg-muted animate-pulse`}></div>

}

export default Skeleton;
