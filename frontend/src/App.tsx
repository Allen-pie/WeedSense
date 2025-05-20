import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
      <Toaster
        // richColors={true}
        // toastOptions={{
        //   style: {
        //     // background: "background",
        //   },
        //   classNames: {
        //     title: "!text-foreground !bg-transparent  !ml-4",
        //     description: "!text-foreground !bg-transparent !ml-4",
        //     icon : ''
        //   },
        // }}
      />
    </Router>
  );
}

export default App;
