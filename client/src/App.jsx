import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://mini-compliance-tracker-backend.onrender.com";


function App() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    due_date: "",
    priority: "Medium",
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Fetch clients
  useEffect(() => {
    axios
      .get(`${API}/clients`)
      .then((res) => setClients(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Fetch tasks
  useEffect(() => {
    if (selectedClient) {
      axios
        .get(`${API}/tasks/${selectedClient._id}`)
        .then((res) => setTasks(res.data))
        .catch((err) => console.log(err));
    }
  }, [selectedClient]);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/tasks`, {
        ...form,
        client_id: selectedClient._id,
      });

      setTasks([...tasks, res.data]);

      setForm({
        title: "",
        description: "",
        category: "",
        due_date: "",
        priority: "Medium",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Update status
  const toggleStatus = async (task) => {
    try {
      const res = await axios.patch(`${API}/tasks/${task._id}`, {
        status: task.status === "Pending" ? "Completed" : "Pending",
      });

      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      console.log(err);
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter ? task.status === statusFilter : true;

    const categoryMatch = categoryFilter
      ? task.category?.toLowerCase().includes(categoryFilter.toLowerCase())
      : true;

    return statusMatch && categoryMatch;
  });
  return (
    <div style={{ padding: "20px" }}>
      <h1>Mini Compliance Tracker</h1>

      {/* CLIENTS */}
      <h2>Clients</h2>
      {clients.map((client) => (
        <div
          key={client._id}
          onClick={() => setSelectedClient(client)}
          style={{
            border: "1px solid gray",
            padding: "10px",
            margin: "5px",
            cursor: "pointer",
            backgroundColor:
              selectedClient?._id === client._id ? "#ddd" : "white",
          }}
        >
          <strong>{client.company_name}</strong>
          <p>{client.country}</p>
        </div>
      ))}

      {/* SELECTED CLIENT */}
      {selectedClient && (
        <>
          <h2>Selected Client: {selectedClient.company_name}</h2>

          {/* ADD TASK */}
          <h3>Add Task</h3>
          <form onSubmit={handleSubmit}>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
            />
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              required
            />
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button type="submit">Add Task</button>
          </form>

          {/* FILTERS */}
          <h3>Filters</h3>
          <select onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            placeholder="Filter by category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          />

          {/* TASK LIST */}
          <h3>Tasks</h3>

          {filteredTasks.length === 0 && <p>No tasks found</p>}

          {filteredTasks.map((task) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);

            const isOverdue = task.status === "Pending" && taskDate < today;
            return (
              <div
                key={task._id}
                style={{
                  border: "1px solid gray",
                  padding: "10px",
                  margin: "5px",
                  backgroundColor: isOverdue ? "#ffcccc" : "white",
                }}
              >
                <strong>{task.title}</strong>

                {isOverdue && (
                  <p style={{ color: "red", fontWeight: "bold" }}>⚠ Overdue</p>
                )}

                <p>Status: {task.status}</p>
                <p>Category: {task.category}</p>
                <p>Priority: {task.priority}</p>
                <p>Due: {new Date(task.due_date).toDateString()}</p>

                <button onClick={() => toggleStatus(task)}>
                  Mark as {task.status === "Pending" ? "Completed" : "Pending"}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default App;
