var Calendar = FullCalendar.Calendar;
var Draggable = FullCalendarInteraction.Draggable

var containerEl = document.getElementById('external-events-list');
new Draggable(containerEl, {
  itemSelector: '.fc-event',
  eventData: function(eventEl) {
    return {
      title: eventEl.innerText.trim()
    }
  }
});

var calendarEl = document.getElementById('calendar');
var calendar = new Calendar(calendarEl, {
  plugins: [ 'bootstrap', 'interaction', 'dayGrid', 'timeGrid', 'list' ],
  themeSystem: 'bootstrap',
  header: {
    left: 'prevYear,prev,next,nextYear today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek'
  },
  // customize the button names,
  // otherwise they'd all just say "list"
  views: {
    listDay: { buttonText: 'list day' },
    listWeek: { buttonText: 'list week' }
  },
  defaultView: 'listDay',
  weekNumbers: false,
  navLinks: true, // can click day/week names to navigate views
  droppable: true, // this allows things to be dropped onto the calendar
  drop: function(arg) {
    // is the "remove after drop" checkbox checked?
    // if (document.getElementById('drop-remove').checked) {
    //   // if so, remove the element from the "Draggable Events" list
    //   arg.draggedEl.parentNode.removeChild(arg.draggedEl);
    // }
  },
  editable: true,
  eventLimit: false, // allow "more" link when too many events
  selectable: true,
  selectMirror: true,
  select: function(arg) {
    var title = prompt('Task:');
    if (title) {
      calendar.addEvent({
        title: title,
        start: arg.start,
        end: arg.end,
        allDay: arg.allDay
      })
    }
    calendar.unselect()
  },
});
calendar.render();

// calendar.addEvent({
//   title: title,
//   start: arg.start,
//   end: arg.end,
//   allDay: arg.allDay
// })
