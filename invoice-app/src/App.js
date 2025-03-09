import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Invoices from "./pages/Invoices";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import FileUpload from "./components/FileUpload";
import DataFetcher from "./components/DataFetcher"; // Import the new component

function App() {
  console.log("✅ API BASE URL:", process.API_BASE_URL);
  return (
    <Provider store={store}>
      <Router>
        <DataFetcher /> {/* Fetches data without breaking Redux context */}
        <div className="min-h-screen bg-gray-100 p-4">
          <nav className="bg-white p-4 shadow-md flex gap-4">
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700"
              }
            >
              Invoices
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700"
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-700"
              }
            >
              Customers
            </NavLink>
          </nav>
          <div className="mt-4">
            <FileUpload /> {/* File Upload UI */}
            <Routes>
              <Route path="/invoices" element={<Invoices editable={true} />} />
              <Route path="/products" element={<Products editable={true} />} />
              <Route
                path="/customers"
                element={<Customers editable={true} />}
              />
              <Route path="*" element={<Invoices editable={true} />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
