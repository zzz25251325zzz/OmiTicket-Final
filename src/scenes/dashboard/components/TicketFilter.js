import React, {useState, useEffect, useContext} from 'react';
import { Table, Tag, Row, Col, Form, Select, Button, Input} from 'antd';
import {findJobs} from '../../../services/JobServices'
import {findLevels} from '../../../services/LevelServices'
import {findStatuses} from '../../../services/StatusServices'
import {findPriorities} from '../../../services/PriorityServices'
import ExportCSVModal from './modals/ExportCSVModal'
import AppContext from '../../../AppContext'

const {Option} = Select

const TicketFilter = ({ setQueryOnSubmit, targetId, setPageData }) => {
    const {user, setUser} = useContext(AppContext)
    const {role} = {...user.data}
    const isAdmin = role.includes('admin') || role.includes('hr') ? true : false

    const [query, setQuery] = useState({})
    const [options, setOptions] = useState({
        jobs : [],
        statuses : [],
        priorities : [],
        levels : [],
        email : ''
    })
    const [timer, setTimer] = useState(null)

    useEffect(() => {
        _fetchOptions()
    },[])

    const _fetchOptions = async () => {
        const responses = await Promise.all([
            findJobs(),
            findStatuses(),
            findPriorities(),
            findLevels(),
        ]) 

        const [jobs, statuses, priorities, levels ] = responses.map( response => {
            const {message, data, success} = {...response}
            return data
        })
    
        return setOptions({
            jobs,
            statuses,
            priorities,
            levels
        })
    }

    
    const handleSelect = (key) => async value => {
        if (value)
            query[key] = value
        else 
            delete query[key]

        clearTimeout(timer)
        
        setQuery({...query})
        
        setTimeout(() => {
            handleSubmit()
        }, 1000)
    }

    const handleInput = (key) => async event => {
        const {target} = {...event}
        const {value} = {...target}

        if (value)
            query[key] = value
        else 
            delete query[key]

        clearTimeout(timer)
        
        setQuery({...query})
        
        setTimeout(() => {
            handleSubmit()
        }, 1000)
    } 

    const handleSubmit = async () => {
        const {job, status, level, priority, email} = {...query}

        setPageData({
            page : 1,
            limit : 10,
            totalPages : 1, 
            total : 1
        })

        setQueryOnSubmit({
            m_job_id : job,
            m_status_id : status,
            m_level_id : level,
            m_priority_id : priority,
            email
        })

        
    }

    return (
        <div>
            <Row gutter={16}>
                <Col span={3} ></Col>
                {
                    isAdmin ?
                    <Col span={3}>
                        <Input id='email'
                                allowClear
                                value={query.email}
                                placeholder='Email'
                                onChange={handleInput('email')}
                                className='SharpButton'
                            />
                    </Col>
                    : null
                }
                
                <Col span={3}>
                    <Select id="job" 
                            allowClear
                            defaultValue={query.job} 
                            placeholder='Job'
                            onChange={handleSelect("job")} 
                            className='SharpButton'
                    >
                        {options.jobs.map(job => 
                            <Option value={job.id}>{job.name}</Option> 
                        )}
                    </Select>            
                </Col>
                <Col span={3}>
                    <Select id="level" 
                            allowClear
                            onChange={handleSelect('level')} 
                            defaultValue={query.level}
                            className='SharpButton'
                            placeholder='Level'
                    >
                        {options.levels.map(level => 
                            <Option value={level.id}>{level.name}</Option> 
                        )}
                    </Select>
                </Col>
                <Col span={3}>
                    <Select id="status" 
                            allowClear
                            onChange={handleSelect('status')} 
                            defaultValue={query.status}
                            className='SharpButton'
                            placeholder='Status'
                    >
                        {options.statuses.map(status => 
                            <Option value={status.id}>{status.name}</Option>
                        )}
                    </Select>
                </Col>
                <Col span={3}>
                    <Select id="priority" 
                            allowClear
                            defaultValue={query.priority}
                            onChange={handleSelect('priority')} 
                            className='SharpButton'
                            placeholder='Priority'
                    >
                        {options.priorities.map(priority => 
                            <Option value={priority.id}>{priority.name}</Option>
                        )}
                    </Select>
                </Col>
                
                <Col span={3}>
                    <ExportCSVModal query={query} departmentId={targetId} />
                </Col>
            </Row>
        </div>

    )
}

export default TicketFilter