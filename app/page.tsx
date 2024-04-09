'use client'
import { useState } from 'react';
import { useMeasure } from '@uidotdev/usehooks';
import { motion } from 'framer-motion'
import dataAm from './data_am.json';
import dataPm from './data_pm.json';
import * as d3 from 'd3';

dataAm.pop();
dataPm.pop();

export default function Home() {
  const [ref, {height, width}] = useMeasure();

  return (
    <main className="max-w-4xl mx-auto my-10">
      <div
        ref={ref}
        className="h-[700px] border border-slate-700 bg-slate-900 rounded-lg"
      >
        {height&&width&&(
          <Chart height={height} width={width}/>
        )}
      </div>
    </main>
  );
}

function Chart({
  height, width
}:{
  height: number,
  width: number
}){
  const [meridiemIndicator, setMeridiemIndicator] = useState('am');
  const [frontData, setFrontData] = useState(dataAm);
  const [backData, setBackData] = useState(dataPm);
  
  const center = {
    x: width/2,
    y: height/2
  }
  const radius = 140;
  const hourTickLength = 15;
  const hourPadding = 10;
  const minuteTickLength = 8;
  const minutePadding = 13;
  
  // @ts-ignore
  const max = parseFloat(d3.max(dataAm, d => d.val));
  const ringScale = d3.scaleLinear([0, max + 20], [radius, radius + 130]);
  const scale = d3.scaleUtc(
    [new Date(2024, 0, 1, 0, 0), new Date(2024, 0, 1, 12, 0)],
    [90, -270]
  );

  // @ts-ignore
  const minutesTicks = scale.ticks(d3.utcMinute.every(4));
  const hourTicks = scale.ticks(12);
  const ringTicks = ringScale.ticks(9);
  hourTicks.shift();
  
  const getPointFromCenter = (distance:number, angle:number) => {
    return {
      x: distance*Math.cos((angle)*(Math.PI/180)) + center.x,
      y: -distance*Math.sin((angle)*(Math.PI/180)) + center.y
    }
  }

  return (
      <div className='relative'>
        <svg
          height={height}
          width={width}
          className='relative'
        >
        {ringTicks.map( (r, index) => {
            return (
              <g key={index} className='text-slate-300'>
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={ringScale(r)}
                  fill='none'
                  strokeOpacity={0.5}
                  strokeDasharray={2}
                  stroke={index%2 === 0? '#1e293b' :'#334155'}
                  strokeWidth={1}
                />
                {index%2 === 0?null:(
                  <text
                    x={width/2}
                    y={(height/2)-ringScale(r)}
                    textAnchor='middle'
                    dominantBaseline='middle'
                    fill='currentColor'
                    opacity={0.9}
                    className='text-[0.5rem] font-bold'
                  >
                    {r}
                  </text>
                )}
              </g>
            ) 
        })}
          
          <circle
            cx={center.x}
            cy={center.y}
            r={radius}
            fill='none'
            stroke='#475569'
            strokeWidth={1}
          />
          <circle
            cx={center.x}
            cy={center.y}
            r={2}
            fill='#475569'
          />
          <g>
            {minutesTicks.map((date, index) => (
              <line
                key={`minute-${index}`}
                x1={getPointFromCenter(radius-minutePadding-minuteTickLength, scale(date)).x}
                y1={getPointFromCenter(radius-minutePadding-minuteTickLength, scale(date)).y}
                x2={getPointFromCenter(radius-minutePadding, scale(date)).x}
                y2={getPointFromCenter(radius-minutePadding, scale(date)).y}
                stroke='#334155'
                strokeOpacity={0.4}
                strokeLinecap='round'
              />
            ))}

          </g>
          <g>
            {hourTicks.map((date, index) => (
              <line
                key={`hour-${index}`}
                x1={getPointFromCenter(radius-hourPadding-hourTickLength, scale(date)).x}
                y1={getPointFromCenter(radius-hourPadding-hourTickLength, scale(date)).y}
                x2={getPointFromCenter(radius-hourPadding, scale(date)).x}
                y2={getPointFromCenter(radius-hourPadding, scale(date)).y}
                stroke='#e2e8f0'
                strokeWidth={2}
                strokeLinecap='round'
              />
            ))}
          </g>
          <g className='text-slate-200'>
            {hourTicks.map((date, index) => (
              <text
                key={`hour_number-${index}`}
                x={getPointFromCenter(radius - 40, scale(date)).x}
                y={getPointFromCenter(radius - 40, scale(date)).y}
                textAnchor='middle'
                dominantBaseline='middle'
                fill='currentColor'
              >
                {index + 1}
              </text>
            ))}
          </g>
          <g>
          {(meridiemIndicator === 'am'? dataPm: dataAm).map((data, index) => {
              const tickLength = data.val;
              return (
                <motion.line
                  key={`backData-${index}`}
                  initial={{
                    x2:getPointFromCenter(radius, scale(new Date(data.time))).x,
                    y2:getPointFromCenter(radius, scale(new Date(data.time))).y
                  }}
                  animate={{
                    x2:getPointFromCenter(ringScale(tickLength), scale(new Date(data.time))).x,
                    y2:getPointFromCenter(ringScale(tickLength), scale(new Date(data.time))).y,
                    transition: {
                      delay: 0.005*(index),
                      duration: 0.5,
                      ease:[0.170, 0.865, 0.185, 1.025]
                    }

                  }}
                  x1={getPointFromCenter(radius, scale(new Date(data.time))).x}
                  y1={getPointFromCenter(radius, scale(new Date(data.time))).y}
                  stroke='#334155'
                  strokeWidth={1}
                  strokeLinecap='round'
                />
                )
              }
            )}
          </g>
          <g>
          {(meridiemIndicator === 'am'? dataAm:dataPm).map((data, index) => {
              const tickLength = data.val;
              // if (tickLength === 0) {
              //   return null
              // }
            return (
              <motion.line
                initial={{
                  x2:getPointFromCenter(radius, scale(new Date(data.time))).x,
                  y2:getPointFromCenter(radius, scale(new Date(data.time))).y
                }}
                animate={{
                  x2:getPointFromCenter(ringScale(tickLength), scale(new Date(data.time))).x,
                  y2:getPointFromCenter(ringScale(tickLength), scale(new Date(data.time))).y,
                  transition: {
                    delay: 0.005*(index),
                    duration: 0.5,
                    ease:[0.170, 0.865, 0.185, 1.025]
                  }

                }}
                key={`frontData-${index}`}
                x1={getPointFromCenter(radius, scale(new Date(data.time))).x}
                y1={getPointFromCenter(radius, scale(new Date(data.time))).y}
                stroke='yellow'
                strokeWidth={1}
                strokeLinecap='round'
              />
              )
            }
          )}
          </g>
          <circle
            cx={center.x}
            cy={center.y}
            r={radius}
            fill='none'
            stroke='black'
            strokeWidth={7}
            strokeOpacity={0.3}
          />
        </svg>
        <div 
          className='absolute flex flex-col items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold tracking-wider rounded-full'
          style={{
            height: radius*2,
            width: radius*2
          }}
        >
          <span>Today's</span>
          <span>World Tweets</span>
          <div className='flex items-center gap-2 mt-3 text-sm font-medium'>
            <span className={`${meridiemIndicator === 'am'? 'text-neutral-200': 'text-neutral-400'} transition-colors`}>AM</span>
            <motion.div 
              className={`flex ${meridiemIndicator === 'am'?'justify-start': 'justify-end'} group h-6 w-16 rounded-full relative cursor-pointer`}
              onClick={() => {
                setMeridiemIndicator(prev => prev === 'am'? 'pm': 'am')
              }}
            >
              <div className='absolute inset-[3px] bg-black rounded-full'/>
              <motion.div layout className='group-hover:bg-slate-600 transition-colors relative bg-slate-700 h-6 w-6 rounded-full'/>
            </motion.div>
            <span className={`${meridiemIndicator === 'pm'? 'text-neutral-200': 'text-neutral-400'} transition-colors`}>PM</span>
          </div>
        </div>
      </div>
  )
}
