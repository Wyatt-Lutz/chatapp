import { useNavigate } from "react-router";

const CheckEmail = ({ email }) => {
  const navigate = useNavigate();
  return (
    <div>
      <div>
        You have received an email at {email} with instructions to change your
        password.
      </div>
      <div>
        When you finish, you can return to this tab and continue to signin.
      </div>
      <button onClick={() => navigate("/signin")}>Return to Signin</button>
    </div>
  );
};
export default CheckEmail;
