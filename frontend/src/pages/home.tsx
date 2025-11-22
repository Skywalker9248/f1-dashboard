import React, { useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import Navbar from '../components/Navbar';
import OverallStandings from '../components/tabs/OverallStandings';
import LastRace from '../components/tabs/LastRace';
import NextRace from '../components/tabs/NextRace';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const Home = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth={false}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper', borderRadius: 1 }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="F1 Dashboard tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem'
              },
              '& .Mui-selected': {
                color: 'primary.main'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3
              }
            }}
          >
            <Tab label="Overall Standings" {...a11yProps(0)} />
            <Tab label="Last Race" {...a11yProps(1)} />
            <Tab label="Next Race" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <OverallStandings />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <LastRace />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <NextRace />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Home;
