import React, { Component } from "react";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };
  }

  componentWillMount() {
    this.fetchTasks();
  }

  fetchTasks = () => {
    console.log("Fetching...");

    fetch("http://127.0.0.1:8000/api/task-list/")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          todoList: data,
        })
      );
  };

  getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  handleChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    console.log("Name:", name);
    console.log("value:", value);

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value,
      },
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("ITEM:", this.state.activeItem);

    var csrftoken = this.getCookie("csrftoken");
    var url = "http://127.0.0.1:8000/api/task-create/";

    if (this.state.editing == true) {
      url = `http://127.0.0.1:8000/api/task-update/ ${this.state.activeItem.id}/`;
      this.setState({
        editing: false,
      });
    }
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(this.state.activeItem),
    })
      .then((response) => {
        this.fetchTasks();
        this.setState({
          activeItem: {
            id: null,
            title: "",
            completed: false,
          },
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  startEdit = (task) => {
    this.setState({
      activeItem: task,
      editing: true,
    });
  };

  deleteItem = (task) => {
    var csrftoken = this.getCookie("csrftoken");

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    }).then((response) => {
      this.fetchTasks();
    });
  };

  strikeUnstike = (task) => {
    task.completed = !task.completed;
    var csrftoken = this.getCookie("csrftoken");

    console.log("Task:", task.completed);
    fetch(`http://127.0.0.1:8000/api/task-update/ ${task.id}/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ completed: task.completed, title: task.title }),
    }).then((response) => {
      this.fetchTasks();
    });
  };

  render() {
    var tasks = this.state.todoList;
    var self = this;
    return (
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 7 }}>
                  <input
                    onChange={this.handleChange}
                    type="text"
                    id="input"
                    className="form-control"
                    name="title"
                    value={this.state.activeItem.title}
                    placeholder="Task Todo..."
                    aria-describedby="emailHelp"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <button
                    id="submit"
                    type="submit"
                    name="add"
                    className="btn btn-primary"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div id="list-wrapper">
            {tasks.map((task, index) => {
              return (
                <div
                  style={{ flex: 7 }}
                  key={index}
                  className="task-wrapper flex-wrapper"
                >
                  <div
                    onClick={() => self.strikeUnstike(task)}
                    style={{ flex: 7 }}
                  >
                    {task.completed == false ? (
                      <span>{task.title}</span>
                    ) : (
                      <strike>{task.title}</strike>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.startEdit(task)}
                      id="edit"
                      className="btn btn-sm btn-outline-info"
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.deleteItem(task)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    );
  }
}

export default App;
