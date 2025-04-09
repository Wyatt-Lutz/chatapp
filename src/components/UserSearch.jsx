import { useEffect, useState } from "react";
import { queryUsernames } from "../services/globalDatService";
import { db } from "../../firebase";
import Close from "./ui/Close";

const UserSearch = ({setAddedUsers}) => {

    const [usernameQueryData, setUsernameQueryData] = useState([]);
    const [searchedUsername, setSearchedUsername] = useState("");
    

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





    return (
        <div> 
            <div>

                <input placeholder="username..." type="text" value={searchedUsername} onChange={(e) => setSearchedUsername(e.target.value)} />
           

                {usernameQueryData && usernameQueryData.length > 0 ? (
                    <div>
                        {usernameQueryData.map((user) => (
                        
                            <div key={user.userUid}>
                                <button onClick={() => setAddedUsers((prev) => [...prev, user])}>
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
            </div>
        </div>
    )


}

export default UserSearch;