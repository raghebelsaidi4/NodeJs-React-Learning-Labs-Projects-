import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';

const Help = () => {
    // const [name, setName] = useState('');
    const [state, setState] = useState({ name: '' });

    useEffect(() => {
        setTimeout(() => {
            setState({ name: 'RA ElSaidy' });
        }, 3000);
        console.log('Set timeout');
    }, []);

    console.log('Rendering');

    const data = [
        {
            name: 'Abdullah Amr',
            email: 'amr@test.com',
        },
        {
            name: 'Omar Islam',
            email: 'islam@test.com',
        },
        {
            name: 'Fahim Abdo',
            email: 'abdo@test.com',
        },
        {
            name: 'Faruk Ahmed',
            email: 'faruk@test.com',
        },
        {
            name: 'Mai Ahmed',
            email: 'mai@test.com',
        },
    ];

    // const data = [];

    return (
        <Layout>
            {/* {name && <h1>Hello {name}, I am Help page</h1>}
			{!name && <h1>Hello Guest, I am Help page</h1>} */}

            {state.name ? (
                <h1>Hello {state.name}, I am Help page</h1>
            ) : (
                <h1>Hello Guest, I am Help page</h1>
            )}

            {data.length > 0 ? (
                <ul>
                    {data.map((item) => (
                        <li>
                            {item.name}, ({item.email})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>There is no data</p>
            )}
        </Layout>
    );
};

export default Help;