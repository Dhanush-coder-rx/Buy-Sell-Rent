
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import { ToastContainer } from 'react-toastify';
import AdminDashboard from './AdminComponents/AdminDashboard';
import BuyerDashboard from './BuyerComponents/BuyerDashboard';
import SellerDashboard from './SellerComponents/SellerDashboard';
import UpdatedPasswordForAdmin from './AdminComponents/UpdatedPasswordForAdmin';
import ManageUsers from './AdminComponents/ManageUsers';
import VerifyProperty from './AdminComponents/VerifyProperty';
import UpdatedPasswordForSeller from './SellerComponents/UpdatedPasswordForSeller';
import PostProperties from './SellerComponents/PostProperties';
import SearchProperty from './BuyerComponents/SearchProperty';
import ChatwithSeller from './BuyerComponents/ChatwithSeller';
import UpdatedPasswordForBuyer from './BuyerComponents/UpdatedPasswordForBuyer';
import ChatwithBuyer from './SellerComponents/ChatwithBuyer';


export const baseUrl = "http://127.0.0.1:8000"; 


function App() {
  return (
    <>

<div className="App">
     <BrowserRouter>
      <ToastContainer />
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reg" element={<Register />} /> 
    
                <Route path="/adminDashboard" element={<AdminDashboard />}>

                <Route path="ManageUsers" element={<ManageUsers />} />
                <Route path="VerifyProperty" element={<VerifyProperty />} />
              
               <Route path="UpdatedPasswordForAdmin" element={<UpdatedPasswordForAdmin />} />  

              </Route>

                    <Route path="/buyerDashboard" element={<BuyerDashboard />}>

                    <Route path="SearchProperty" element={<SearchProperty />} />
                    <Route path="ChatwithSeller" element={<ChatwithSeller />} />
                   
                    <Route path="UpdatedPasswordForBuyer" element={<UpdatedPasswordForBuyer />} />

                    </Route>


                    

                    <Route path="/sellerDashboard" element={<SellerDashboard />}>

                    <Route path="PostProperties" element={<PostProperties />} />
                    <Route path="ChatwithBuyer" element={<ChatwithBuyer />} />
                   
                    <Route path="UpdatedPasswordForSeller" element={<UpdatedPasswordForSeller />} />

                    </Route>
         
                </Routes>
      </BrowserRouter>
            </div>
    </>
  );
}

export default App;
