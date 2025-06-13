import './calendar.css';
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom';
import {eachDayOfInterval, endOfMonth, format, startOfMonth, getISODay, isToday, addMonths, subMonths} from 'date-fns';
//Used to give more classNames to HTML elements
import clsx from 'clsx'
import { useEffect, useState } from 'react';
import Backdrop from '../backdrop/backdrop';
import Modal from '../Modal/modal.jsx';

//Array with all the days of the week
const week= ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getContrastColor(color) {
    // Create a canvas context to resolve named colors to RGB/HEX
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    const computedColor = ctx.fillStyle;
  
    // If the result is in RGB, convert it to HEX
    let hex = computedColor;
    if (computedColor.startsWith("rgb")) {
      const [r, g, b] = computedColor.match(/\d+/g).map(Number);
      hex = "#" + [r, g, b]
        .map(c => c.toString(16).padStart(2, '0'))
        .join('');
    }
  
    // Remove the '#' and extract RGB values
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    // Calculate the luminance using the perceived brightness formula
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  
    // If the background is light, return black text; otherwise, return white
    return luminance > 186 ? "#000000" : "#FFFFFF";
  }  

function Calendar(){
    //The part where all the events are grabbed
    const navigate=useNavigate();
    const cookies = new Cookies();
    const [SelectedDay, SetIsSelectedDay]= useState(null);
    const [events, setEvents]= useState([]);
    useEffect(()=>{
        const FetchEvents= async ()=>{
            try{
                //Fetching the data from EventsController in the backend
                const res= await fetch('https://localhost:7242/api/events/index',{
                    headers: { 
                    'Authorization' : cookies.get('JWT')
                }});
                const data= await res.json();
                setEvents(data);
            }
            catch(error){
                console.error('Fetching problem: ', error); 
            }
        };
        FetchEvents();
    },[]);
    const [currentDay, setCurrentDay]= useState(new Date());
    //Click handlers for going to the previous or next Month
    const PrevMonth= ()=>{
        const newDay= subMonths(currentDay,1);
        setCurrentDay(newDay); 
    };
    const NextMonth= ()=>{
        const newDay= addMonths(currentDay,1);
        setCurrentDay(newDay);
    };
    //Getting the first and last day of the current month
    const firstDay= startOfMonth(currentDay);
    const lastDay= endOfMonth(currentDay);
    //Creating an array that represents all the days in the current month 
    const days= eachDayOfInterval({
        start: firstDay,
        end: lastDay
    })
    //Getting the day of the week in which the month ends and starts
    const startDayIndex= getISODay(firstDay);
    const endDayIndex= getISODay(lastDay);
    //Obtaining the current month and year
    const [month, year]= format(currentDay,'MMMM yyyy').split(' ');
    return (
        <div className="calendar">
            <div className='Title'>
                <button className='Buttons' onClick={PrevMonth}>{'\u2190'}</button>
                <h2 className='text-center'> {month} {year}</h2>
                <button className='Buttons' onClick={NextMonth}>{'\u2192'}</button>
            </div>
            <div className='DaysOfWeek'>
                
                {/* Printing the days of the week. */
                    week.map((day)=>{
                        return <div key={day} className='Days'>{day}</div>
                })}
            </div>
            <div className='Weeks'>
                {/* Printing the emty spaces that represents the offset of each month. */
                    Array.from({length:startDayIndex-1}).map((_, index)=>{
                        return(
                            <div key={`empty-${index}`} className='Dates'/>
                        );
                })}
                    {/* Printing all the days of the month + the titles of the activities 
                        that are scheduled on those dates. */
                        days.map((day,index)=>{
                            const dateString= format(day, 'yyyy-MM-dd');
                            const eventsDay= events.filter(ev=>ev.date.startsWith(dateString));
                            return(
                                <div key={index} className={clsx('Dates', {
                                    'Actual': isToday(day)
                                })} onClick={(e) => SetIsSelectedDay(day)}>

                                    <span>{format(day, 'd')}</span>
                                    {
                                        eventsDay.length>0 ? 
                                    (eventsDay.length==1?
                                        <div key={eventsDay[0].id} style={{backgroundColor: eventsDay[0].color, width: 'fit-content', color: getContrastColor(eventsDay[0].color)}}>
                                            {eventsDay[0].title}
                                        </div>:
                                            <div key={`multipu-${index}`} style={{backgroundColor: 'darkred', width: 'fit-content', color: getContrastColor('darkred')}}>
                                                Bad day
                                            </div>):
                                                <div></div>
                                    }
                                </div>
                            );
                })}
                { //Printing an array of empty spaces to complete the last week of the month
                    Array.from({length:7-endDayIndex}).map((_, index)=>{
                        return(
                            <div key={`empty-${index}`} className='Dates'/>
                        );
                })}
                {//Special window that shows the details of al the events scheduled in the day that was selected
                    SelectedDay && (
                        <>
                            <Backdrop onClick={()=> SetIsSelectedDay(null)}/>
                            <Modal style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000}}>
                                <div style={{textAlign:'center'}}>
                                    <button onClick={() => SetIsSelectedDay(null)}>Close</button>
                                    {events.filter(ev => format(new Date(ev.date), 'yyyy-MM-dd') === format(SelectedDay, 'yyyy-MM-dd'))
                                        .map((ev)=>{
                                            const handlePress= ()=>{
                                                navigate(`/Event/Edit/${ev.id}`);
                                            };
                                            return(
                                                <div key={'calendarTile'+ev.id} style= {{background:ev.color, color:getContrastColor(ev.color), width: 'fit-content', textAlign:'center'}}>
                                                    <div>Title: {ev.title}</div>
                                                    <div>Description: {ev.description}</div>
                                                    <div>Date: {format(ev.date,'dd MMMM yyyy')}</div>
                                                    <div>Time: {format(ev.date,'HH:mm')}</div>
                                                    <button onClick={handlePress}>Edit event</button>
                                                </div>
                                            );
                                        })}
                                </div>
                            </Modal>
                        </>
                    )
                }
            </div>
        </div>
    )
}
export default Calendar