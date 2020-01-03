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

function TasksCalendar(state, action) {
  if (typeof state === 'undefined') { return { tasks: [] }; }

  var newState = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    case 'TASK_ADDED':
      return newState;
    case 'TASK_MOVED':
      return newState;
    case 'TASK_COMPLETED':
      return newState;
    default:
      return state;
  }
}

function persist(state) {
  localStorage.setItem('TASKS_MARATHON', JSON.stringify(state))
}

function render(state) {
  calendar.removeAllEvents()

  state.tasks.forEach(task => {
    calendar.addEvent({
      title: task.title,
      start: task.start,
      end: task.end,
      allDay: task.allDay
    })

    // <label for="for3" class='fc-event'>
    //   <input type="checkbox" name="for3" id="for3">
    //   <span>My Event 1</span>
    // </label>
  })
}

store = StateMachine(TasksCalendar);

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
  defaultView: 'timeGridDay',
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
      store.dispatch({
        type: 'TASK_ADDED',
        payload: { title, start: arg.start, end: arg.end, allDay: arg.allDay }
      })
    }
    calendar.unselect()
  },
});
calendar.render();

var state = store.getState();

store.subscribe(render);
render(state);
store.subscribe(persist);
persist(state);

// document.getElementById('')
