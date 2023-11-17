import React, { useEffect, useState } from 'react';
import axios from "axios";
import './App.css';

function App() {
  const [prizes, setPrizes] = useState([]);
  const [multipleWinners, setMultipleWinners] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [years, setYears] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    const apiUrl = 'http://api.nobelprize.org/v1/prize.json';
    const proxyUrl = 'https://thingproxy.freeboard.io/fetch/';


    const fetchData = async () => {

      try {
        const response = await axios.get(proxyUrl + apiUrl);
        const data = await response.data;

        const allPrizes = data.prizes;
        console.log(allPrizes);

        setPrizes(allPrizes);
        populateDropdowns(allPrizes);
        findMultipleTimeWinners(allPrizes);
      }
      catch (error) {
        console.error('Error fetching Nobel Prize data:', error);
      }
    };

    fetchData();
  }, []);

  const populateDropdowns = (prizes) => {
    const uniqueCategories = ['all', ...new Set(prizes.map(prize => prize.category))];
    setCategories(uniqueCategories);

    const uniqueYears = ['all', ...new Set(prizes.map(prize => prize.year))];
    setYears(uniqueYears);
  };

  const filterPrizes = () => {
    if (!prizes) {
      return [];
    }

    const filteredPrizes = prizes.filter((prize) =>
      (selectedCategory === 'all' || prize.category === selectedCategory) &&
      (selectedYear === 'all' || prize.year.toString() === selectedYear)
    );
    return filteredPrizes;
  };

  const findMultipleTimeWinners = (prizes) => {
    if (!Array.isArray(prizes)) {
      console.error('Invalid data format: prizes is not an array');
      return;
    }

    const laureateMap = new Map();
    prizes.forEach((prize) => {
      if (Array.isArray(prize.laureates)) {
        prize.laureates.forEach((laureate) => {
          const key = laureate.id;
          laureateMap.set(key, { count: (laureateMap.get(key)?.count || 0) + 1, info: laureate });
        });
      }
    });

    const winners = Array.from(laureateMap.values()).filter(({ count }) => count > 1);

    setMultipleWinners(winners);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  return (
    <div className="App">
      <h1>Nobel Prize Winners</h1>

      <div className="filters">
        <div className='fil'>
          <label htmlFor="category">Filter by Category:</label>
          <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className='fil'>
          <label htmlFor="year">Filter by Year:</label>
          <select id="year" value={selectedYear} onChange={handleYearChange}>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

      </div>
      <hr />
      <br />
      <div className="prize-list">
        {filterPrizes().map((prize) => (
          <div key={prize.year + prize.category} className="prize">
            <strong>Year:</strong> {prize.year}<br />
            <strong>Category:</strong> {prize.category}<br />
            <strong>Motivation:</strong> {prize.motivation}<br />
            <strong>Laureates:</strong>
            <ul>
              {Array.isArray(prize.laureates) &&
                prize.laureates.map((laureate) => (
                  <li key={laureate.id} className='listItem'>
                    {laureate.firstname} {laureate.surname}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <br />
      <div className='lastSec'>
        <h2>Multiple-Time Winners</h2>
        <div className="multiple-winners">
          {multipleWinners.map(winner => (
            <div key={winner.info.id} className="multiple-winner">
              <strong>{winner.info.firstname} {winner.info.surname}</strong>
              has won the Nobel Prize {winner.count} times.
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;
