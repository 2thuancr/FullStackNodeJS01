import React, { useContext, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    console.log(">>> check auth: ", auth);

    const items = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link to={"/"}>Home Page</Link>,
        },
        ...(auth.isAuthenticated ? [
            {
                key: 'user',
                icon: <UsergroupAddOutlined />,
                label: <Link to={"/user"}>Users</Link>,
            }
        ] : []),
        {
            label: `Welcome ${auth?.user?.email ?? ""}`,
            key: 'SubMenu',
            icon: <SettingOutlined />,
            children: [
                ...(auth.isAuthenticated ? [
                    {
                        key: 'logout',
                        label: <span onClick={() => {
                            localStorage.clear("access_token");
                            setAuth({ isAuthenticated: false, user: { email: "", name: "" } });
                            navigate("/");
                        }}>Đăng xuất</span>
                    }
                ] : []),
                ...(auth.isAuthenticated ? [] : [
                    {
                        key: 'login',
                        label: <Link to={"/login"}>Đăng nhập</Link>
                    }
                ])
            ]
        }
    ];

    const [current, setCurrent] = useState('mail');

    const onClick = (e) => {
        console.log('click', e);
        setCurrent(e.key);
    };

    return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;

