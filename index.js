document.addEventListener('DOMContentLoaded', function() {
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
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    // defaultDate: '2019-08-12',
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
  });
  calendar.render();
});
