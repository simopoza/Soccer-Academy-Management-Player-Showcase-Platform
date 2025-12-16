const db = require('./db');

async function insertSampleStats() {
  try {
    console.log('🔄 Checking for existing players...');

    // Check if there are any players
    const [players] = await db.query('SELECT id FROM Players LIMIT 10');
    
    if (players.length === 0) {
      console.log('⚠️  No players found in the database.');
      console.log('📝 You need to create player accounts first before adding stats.');
      console.log('');
      console.log('Alternative: Creating sample stats data without requiring specific players...');
      console.log('');
      
      // Since we don't have players, let's just check if we can display the chart
      // with some basic data structure
      console.log('✅ The chart will show "No performance data available" until players create match stats.');
      console.log('');
      console.log('To fix this, you need to:');
      console.log('1. Register some player accounts');
      console.log('2. Admin approves them');
      console.log('3. Players complete their profiles');
      console.log('4. Create matches and add player stats to those matches');
      
      process.exit(0);
    }

    console.log(`✅ Found ${players.length} players`);
    console.log('📝 Inserting sample stats...');

    // Get some recent match IDs
    const [matches] = await db.query('SELECT id FROM Matches ORDER BY date DESC LIMIT 15');
    
    if (matches.length === 0) {
      console.log('⚠️  No matches found. Please run the sample-data.sql first.');
      process.exit(1);
    }

    console.log(`✅ Found ${matches.length} matches`);

    // Insert sample stats - use actual player IDs and match IDs
    let statsInserted = 0;
    
    for (let i = 0; i < Math.min(matches.length, 10); i++) {
      const matchId = matches[i].id;
      
      // Add stats for 2-4 players per match
      const playersToAdd = Math.min(players.length, Math.floor(Math.random() * 3) + 2);
      
      for (let j = 0; j < playersToAdd; j++) {
        const playerId = players[j % players.length].id;
        
        // Generate random but realistic stats
        const goals = Math.floor(Math.random() * 3); // 0-2 goals
        const assists = Math.floor(Math.random() * 3); // 0-2 assists
        const minutesPlayed = 90; // Full match
        const rating = (Math.random() * 4 + 6).toFixed(1); // 6.0-10.0 rating
        
        try {
          await db.query(
            'INSERT IGNORE INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES (?, ?, ?, ?, ?, ?)',
            [playerId, matchId, goals, assists, minutesPlayed, rating]
          );
          statsInserted++;
        } catch (error) {
          // Skip if duplicate (player already has stats for this match)
          if (error.code !== 'ER_DUP_ENTRY') {
            console.error(`Error inserting stat: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ Successfully inserted ${statsInserted} stat records!`);
    console.log('');
    console.log('🎉 Performance chart should now display data!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting sample stats:', error.message);
    process.exit(1);
  }
}

insertSampleStats();
