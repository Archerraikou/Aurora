import './calendar.css';
import {eachDayOfInterval, endOfMonth, format, startOfMonth, getISODay, isToday, addMonths, subMonths} from 'date-fns';
import clsx from 'clsx'
import { useEffect, useState } from 'react';
const week= ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Calendar(){
    const [events, setEvents]= useState([]);
    useEffect(()=>{
        async ()=>{
            try{
                const res= await fetch('https://localhost:7242/api/schedule');
                const data= await res.json();
                setEvents(data);
            }
            catch(error){
                console.error('Fetching problem: ', error);
            }
        };
    },[]);
    const [currentDay, setCurrentDay]= useState(new Date());
    const prevMonth= ()=>{
        const newDay= subMonths(currentDay,1);
        setCurrentDay(newDay); 
    };
    const nextMonth= ()=>{
        const newDay= addMonths(currentDay,1);
        setCurrentDay(newDay);
    };
    const firstDay= startOfMonth(currentDay);
    const lastDay= endOfMonth(currentDay);

    const days= eachDayOfInterval({
        start: firstDay,
        end: lastDay
    })
    const startDayIndex= getISODay(firstDay);
    const endDayIndex= getISODay(lastDay);
    const [month, year]= format(currentDay,'MMMM yyyy').split(' ');
    return (
        <div>
            <div className='Title'>
                <button className='Buttons' onClick={prevMonth}>{'\u2190'}</button>
                <h2 className='text-center'> {month} {year}</h2>
                <button className='Buttons' onClick={nextMonth}>{'\u2192'}</button>
            </div>
            <div className='DaysOfWeek'>
                {week.map((day)=>{
                    return <div key={day} className='Days'>{day}</div>
                })}
            </div>
            <div className='Weeks'>
                {Array.from({length:startDayIndex-1}).map((_, index)=>{
                    return(
                        <div key={`empty-${index}`} className='Dates'/>
                    );
                })}
                {days.map((day,index)=>{
                    const dateString= format(day, 'yyyy-MM-dd');
                    const eventsDay= events.filter(ev=>ev.date.startsWith(dateString));
                    return(
                        <div key={index} className={clsx('Dates', {
                            'Actual': isToday(day)
                        })}>

                            <span>{format(day, 'd')}</span>
                            {
                                eventsDay.length>0 ? 
                                events.length===1?
                                <div key={eventsDay[0].id} style={{backgroundColor: eventsDay[0].color}}>{eventsDay[0].title}</div>:
                                <div key={`multipu-${index}`} style={{backgroundColor: 'red'}}>Multiple</div>:
                                <div></div>
                            }
                        </div>
                    );
                })}
                {Array.from({length:7-endDayIndex}).map((_, index)=>{
                    return(
                        <div key={`empty-${index}`} className='Dates'/>
                    );
                })}
            </div>
        </div>
    )
}
export default Calendar