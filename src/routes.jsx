import { Home, Profile, SignIn, SignUp , Collaboration } from "@/pages";
import QuickConsultationPage from "@/Components/Consultations/QuickConsultationPage";
import DetailsConsultation from "@/Components/Consultations/DetailsConsultation";
import BuyProject from "@/Components/GServices/buyProject";
import ServiceDetails from "@/Components/GServices/serviceDetails";


export const routes = [
  {
    name: "home",
    path: "/home",
    element: <Home />,
  },
  {
    name: "Services",
    path: "/buyProject",
    element: <BuyProject />,
  },
  {
    name: "Blog",
    path: "/profile",
    element: <Profile />,
  },
  {
    name: "Collaboration",
    path: "/collaboration",
    element: <Collaboration/>,
  },
  {
    name :"Consultation",
    path: "/do-a-quick-consultation",
    element: <QuickConsultationPage />,
  },

  {
    path: "/serviceDetails/:serviceId",
    element: <ServiceDetails />,
  },

  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },

  {
    path: "/details-consultation/:id", // Ajoutez un paramètre d'ID à la route
    element: <DetailsConsultation />,
  },
];

export default routes;
