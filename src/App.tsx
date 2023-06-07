import { useRoutes } from "react-router-dom";
import routes from "Routes";

const App: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

export default App;