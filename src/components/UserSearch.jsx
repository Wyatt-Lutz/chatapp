import { useEffect, useState } from "react";
import { queryUsernames } from "../services/globalDataService";
import { db } from "../../firebase";
import CloseModal from "./ui/CloseModal";
import { useAuth } from "../context/providers/AuthContext";
import BlockedUserWarning from "./BlockedUserWarning";
import { getBlockData } from "../services/memberDataService";

const UserSearch = ({addedUsers, setAddedUsers}) => {

    const [usernameQueryData, setUsernameQueryData] = useState([]);
    const [searchedUsername, setSearchedUsername] = useState("");
    const [modal, setModal] = useState({ type: "", user: null });

    const { currUser } = useAuth();
    useEffect(() => {
        if (!searchedUsername.trim()) {
            setUsernameQueryData([]);
            return;
        }

        const fetchUsernames = async() => {
            const usernameQueryData = await queryUsernames(db, searchedUsername);
            if (!usernameQueryData) {
                setUsernameQueryData([]);
                return;
            }
            const transformedData = Object.entries(usernameQueryData).map(([userUid, userData]) => (
                {userUid, ...userData}
            ));

            console.log(transformedData);
            setUsernameQueryData(transformedData);
        }

        const timeout = setTimeout(fetchUsernames, 300);
        return () => clearTimeout(timeout);
    }, [searchedUsername]);

    useEffect(() => {
      console.log(addedUsers);
    }, [addedUsers]);

    const addUser = async(user) => {
      if (addedUsers.some((addedUser) => addedUser.userUid === user.userUid)) return;

      const [currUserBlockData, addedUserBlockData] = await Promise.all([
        getBlockData(db, currUser.uid),
        getBlockData(db, user.userUid),
      ]);

      if (addedUserBlockData[currUser.uid]) {
        console.log('The user you are adding has blocked you. You cannot add them to a group chat');
        return;
      }
      if (currUserBlockData[user.userUid]) {
        setModal({ type: "blockedWarning", user: user })
        return;
      }


      setAddedUsers((prev) => [...prev, user]);
    }





    return (
        <div>
          {modal.type === "blockedWarning" && (
            <BlockedUserWarning setModal={setModal} setAddedUsers={setAddedUsers} user={modal.user} />
          )}


                <input placeholder="username..." type="text" value={searchedUsername} onChange={(e) => setSearchedUsername(e.target.value)} />


                {usernameQueryData && usernameQueryData.length > 0 ? (
                    <div>
                        {usernameQueryData.map((user) => (

                            <div key={user.userUid}>
                                <button onClick={() => addUser(user)}>
                                    <div className="h-8 w-8 rounded-full overflow-hidden">
                                        <img className="h-full w-full object-cover" src={user.profilePictureURL} />
                                    </div>
                                    <span>{user.username}</span>
                                </button>
                            </div>


                        ))}
                    </div>
                ) : (
                    <div>No Matching usernames</div>
                )}

            {addedUsers && addedUsers.length > 0 && (
            <div>
              {addedUsers.map((user) => (
                  <div key={user.userUid}>
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                          <img className="h-full w-full object-cover" src={user.profilePictureURL} />
                      </div>
                      <span>{user.username}</span>
                      <button onClick={() => setAddedUsers((prev) => prev.filter((addedUser) => addedUser.userUid !== user.userUid ))}>
                          <CloseModal />
                      </button>

                  </div>
              ))}
            </div>
          )}

        </div>
    )


}

export default UserSearch;
