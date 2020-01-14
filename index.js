function addTask(arg) {
  var title = prompt('Task:');
  if (title) {
    store.dispatch({
      type: TASK_ADDED,
      payload: { title, start: arg.start, end: arg.end, allDay: arg.allDay }
    })
  }
}

function emptyElement(element) {
  while(element.firstChild) { element.removeChild(element.firstChild); }
}

var Calendar = FullCalendar.Calendar;
// var Draggable = FullCalendarInteraction.Draggable

var containerEl = document.getElementById('external-events-list');
// new Draggable(containerEl, {
//   itemSelector: '.fc-event',
//   eventData: function(eventEl) {
//     return {
//       title: eventEl.innerText.trim(),
//       duration: '00:30' // DEFAULT_TASK_DURATION
//     }
//   }
// });

const TASK_ADDED = 'TASK_ADDED';
const TASK_MOVED = 'TASK_MOVED';
const TASK_REMOVED = 'TASK_REMOVED';
const TASK_COMPLETED = 'TASK_COMPLETED';
const CLEAR_COMPLETED = 'CLEAR_COMPLETED';

const DEFAULT_TASK_DURATION = 0.5;

function realignStart(state) {
  var h = 0;
  state.tasks.forEach(task => {
    if (task.isCompleted) { return; }

    const newStart = new Date();
    newStart.setSeconds(0,0);
    task.start = newStart.addHours(h);
    task.end = task.start.addHours(DEFAULT_TASK_DURATION);
    h += DEFAULT_TASK_DURATION
  })
}

function jsonParse(string) {
  const state = JSON.parse(string);
  if (state) {
    state.tasks.forEach(task => {
      task.start = new Date(task.start)
      task.end = new Date(task.end)
    })
  }
  return state;
}

Date.prototype.addHours = function(h) {
  const date = new Date(this);
  date.setTime(this.getTime() + (h*60*60*1000));
  return date;
}

function initialState() {
  var state = jsonParse(localStorage.getItem('TASKS_MARATHON'));

  if (!state) { return { tasks: [] }; }

  realignStart(state);
  return state;
}

function uuid() {
  return 'hxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function changeById(taskId, state, cb) {
  state.tasks = state.tasks.map(task => task.id === taskId ? cb(task) : task);
}

function removeTask(taskId, state) {
  changeById(taskId, state, task => undefined);
  state.tasks = state.tasks.filter(Boolean)
}

function moveTask(taskData, state) {
  changeById(taskData.id, state, task => ({ ...task, ...taskData }))
  state.tasks.sort((a,b) => a.start.getTime() - b.start.getTime())
  realignStart(state)
}

function completeTask(taskId, state) {
  var firstTask = state.tasks.find(task => !task.isCompleted);
  var end = new Date(); end.setSeconds(0,0);
  changeById(taskId, state, task => ({ ...task, isCompleted: !task.isCompleted, end, start: firstTask.start }))
  state.tasks.sort((a,b) => {
    if (a.isCompleted && !b.isCompleted) {
      return -1;
    }
    if (!a.isCompleted && b.isCompleted) {
      return 1;
    }
    return a.start.getTime() - b.start.getTime();
  });
  realignStart(state)
}

function Task(props) {
  return { id: uuid(), isCompleted: false, ...props }
}

function firstAvailableTime(state) {
  var latestDate = new Date();
  state.tasks.forEach(task => latestDate = latestDate > task.end ? latestDate : task.end);
  return latestDate;
}

function TasksCalendar(state, action) {
  if (typeof state === 'undefined') { return initialState(); }

  console.log(action.type, action);
  var newState = jsonParse(JSON.stringify(state));

  switch (action.type) {
    case CLEAR_COMPLETED:
      newState.tasks = newState.tasks.filter(task => !task.isCompleted)
      return newState;
    case TASK_ADDED:
      const start = action.payload.start || firstAvailableTime(newState);
      const end = action.payload.end || start.addHours(DEFAULT_TASK_DURATION);
      const newTask = Task({ ...action.payload, start, end });
      newState.tasks.push(newTask);
      return newState;
    case TASK_REMOVED:
      removeTask(action.payload, newState);
      return newState;
    case TASK_MOVED:
      moveTask(action.payload, newState);
      return newState;
    case TASK_COMPLETED:
      completeTask(action.payload, newState)
      return newState;
    default:
      return state;
  }
}

function persist(state) {
  localStorage.setItem('TASKS_MARATHON', JSON.stringify(state))
}

function render(state) {
  console.log(state);
  calendar.removeAllEvents()
  emptyElement(containerEl);

  const clearCompletedTasksButton = document.getElementById('clear-completed-tasks-button');
  clearCompletedTasksButton.style.display = state.tasks.some(task => task.isCompleted) ? 'block' : 'none';

  state.tasks.forEach(task => {
    calendar.addEvent({
      title: task.title,
      start: task.start,
      className: task.isCompleted ? 'is-completed' : '',
      end: task.end,
      allDay: task.allDay,
      extendedProps: task,
    })

    // <label for="for3" class='fc-event'>
    //   <input type="checkbox" name="for3" id="for3">
    //   <span>My Event 1</span>
    // </label>
    const label = document.createElement('label');
    label.addEventListener('click', function() {
      store.dispatch({
        type: TASK_COMPLETED,
        payload: task.id,
      })
    })
    label.htmlFor = task.id;
    label.className = task.isCompleted ? 'fc-event is-completed' : 'fc-event';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = task.id;
    input.checked = task.isCompleted;
    input.id = task.id;
    label.appendChild(input);
    const span = document.createElement('span');
    span.innerText = task.title;
    label.appendChild(span)
    const i = document.createElement('i');
    i.className = "fa fa-trash remove-task";
    i.addEventListener('click', function() {
      store.dispatch({
        type: TASK_REMOVED,
        payload: task.id
      });
    })
    label.appendChild(i)
    containerEl.appendChild(label);
  })
}

store = StateMachine(TasksCalendar);

var state = store.getState();
var firstTask = state.tasks.sort((a, b) => a.start.getTime() - b.start.getTime()).find(task => !task.isCompleted)
var now = new Date(); now.setSeconds(0,0);
var firstTaskStart = firstTask ? firstTask.start : now;

var beginningOfDay = new Date();
beginningOfDay.setHours(0,0,0,0);

firstTaskStart = firstTaskStart.addHours(-2);

firstTaskStart = firstTaskStart > beginningOfDay ? firstTaskStart : beginningOfDay;

var scrollTime = firstTaskStart.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).substr(0, '00:00:00'.length);

var calendarEl = document.getElementById('calendar');
var calendar = new Calendar(calendarEl, {
  plugins: [ 'bootstrap', 'interaction', 'dayGrid', 'timeGrid', 'list' ],
  nowIndicator: true,
  themeSystem: 'bootstrap',
  scrollTime,
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

  // droppable: true, // this allows things to be dropped onto the calendar
  // drop: function(arg) {
    // is the "remove after drop" checkbox checked?
    // if (document.getElementById('drop-remove').checked) {
    //   // if so, remove the element from the "Draggable Events" list
    //   arg.draggedEl.parentNode.removeChild(arg.draggedEl);
    // }
  // },

  editable: true,
  eventLimit: false, // allow "more" link when too many events
  selectable: true,
  selectMirror: true,
  select: function(arg) {
    addTask(arg)
    calendar.unselect()
  },
  eventClick: function(info) {
    const task = info.event.extendedProps;
    store.dispatch({
      type: TASK_COMPLETED,
      payload: task.id,
    })
  },

  // delta - A Duration Object that represents the amount of time the event was moved by.
  // el - The HTML element that was dragged.
  // event - An Event Object that holds information about the event (date, title, etc) after the drop.
  // jsEvent - The native JavaScript event with low-level information such as click coordinates.
  // newResource - If the resource has changed, this is the Resource Object the event went to. If the resource has not changed, this will be undefined. For use with the resource plugins only.
  // oldEvent - An Event Object that holds information about the event before the drop.
  // oldResource - If the resource has changed, this is the Resource Object the event came from. If the resource has not changed, this will be undefined. For use with the resource plugins only.
  // revert - A function that, if called, reverts the event’s start/end date to the values before the drag. This is useful if an ajax call should fail.
  // view - The current View Object.
  eventDrop: function(info) {
    const event = info.event;
    const task = event.extendedProps;
    store.dispatch({
      type: TASK_MOVED,
      payload: { id: task.id, start: event.start, end: event.end },
    })
  },
  // el - The HTML element that was being dragged.
  // endDelta - A Duration Object that represents the amount of time the event’s end date was moved by.
  // event - An Event Object that holds information about the event (date, title, etc) after the resize.
  // jsEvent - The native JavaScript event with low-level information such as click coordinates.
  // prevEvent - An Event Object that holds information about the event before the resize.
  // revert - A function that, if called, reverts the event’s start/end date to the values before the drag. This is useful if an ajax call should fail.
  // startDelta - A Duration Object that represents the amount of time the event’s start date was moved by.
  // view - The current View Object.
  eventResize: function(info) {
    const event = info.event;
    const task = event.extendedProps;
    store.dispatch({
      type: TASK_MOVED,
      payload: { id: task.id, start: event.start, end: event.end },
    })
  },
});
calendar.render();

store.subscribe(render);
store.subscribe(persist);
render(state);
persist(state);

const addTaskButton = document.getElementById('add-task-button');
addTaskButton.addEventListener('click', addTask)

const clearCompletedTasksButton = document.getElementById('clear-completed-tasks-button');
clearCompletedTasksButton.addEventListener('click', function() {
  store.dispatch({ type: CLEAR_COMPLETED })
})
