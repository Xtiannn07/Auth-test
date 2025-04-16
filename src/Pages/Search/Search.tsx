import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchHeader from './SearchHeader';
import UsersCards from './UsersCards';
import { fetchUsers } from './api';

const SearchPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: users, refetch } = useQuery('users', fetchUsers);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refetch();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refetch]);

    return (
        <div className="search-page">
            <SearchHeader setSearchTerm={setSearchTerm} />
            <div className="user-cards">
                {searchTerm === '' && users?.slice(0, 5).map(user => (
                    <UsersCards key={user.id} user={user} />
                ))}
            </div>
        </div>
    );
};

export default SearchPage;