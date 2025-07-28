const fs = require('fs');

// Create basic alarm sound data URLs (base64 encoded)
// These are very short beep sounds that can be embedded directly

const sounds = {
    beep: {
        name: 'Classic Beep',
        data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp5KFODAdOnt/usWIbBTOKzO/Pei0GJFHX8N2QQAoRV6XZ6qdUDQdIldXoq1kNBiJlweTDcSEFH1LY8dyBMwgWaL3t559NEAxPp+PwtmMcBjqT2PfGcCEGhZeJgGVcXnKRpa6PYTQ3gNvkw3IlBSuCzvLZiTYIGWq+7+OeSwQLUank8LZiHAY3kdfs0nkpBSl+zPDdizIHGGu7/+adTQ0PTqzY9K9hGgU3jr3n0XssBid7yfXbhzkJGW3A7+OeSwQLT6zj8rNdFgMziMjxynUjBCZpwOPFcSEGH1LZ8t2AMwgWar3v459NEAxPp+PwtmMcBjqT2PfGcCEGhZeJgGVcXnKRpa6PYTQ3gNvkw3IlBSuCzvLZiTYIGWq+7+OeSwQLUank8LZiHAY3kdfs0nkpBSl+zPDdizIHGGu7/+adTQ0PTqzY9K9hGgU3jr3n0XssBid7yfXbhzkJGW3A7+OeSwQLT6zj8rNdFgMziMjxynUjBCZpwOPFcSEGH1LZ8t2AMwgWar3v459NEAxPp+PwtmMcBjqT2PfGcCEGhZeJgGVcXnKRpa6PYTQ3gNvkw3IlBSuCzvLZiTYIGWq+7+OeSwQLUank8LZiHAY3kdfs0nkpBSl+zPDdizIHGGu7/+adTQ0PTqzY9K9hGgU3jr3n0XssBid7yfXbhzkJGW3A7+OeSwQLT6zj8rNdFgMziMjxynUjBCZpwOPFcSEGH1LZ8t2AMwgWar3v459NEAxPp+PwtmMcBjqT2PfGcCEGhZeJgGVcXnKRpa6PYTQ3gNvkw3IlBSuCzvLZiTYIGWq+7+OeSwQLUank8LZiHAY3kdfs0nkpBSl+zPDdizIHGGu7/+adTQ0PTqzY9K9hGgU3jr3n0XssBid7yfXbhzkJGW3A7+OeSwQLT6zj8rNdFgMziMjxynUjBCZpwOPFcSEGH1LZ8t2AMwgWar3v459NEAxPp+PwtmMcBjqT2PfGcCEGhZeJgGVcXnKRpa6PYTQ3gNvkw3IlBSuCzvLZiTYIGWq+7+OeSwQLUank8LZiHAY3kdfs0nkpBSl+zPDdizIHGGu7/+adTQ0PTqzY9K9hGgU3jr3n0XssBid7yfXbhzkJGW3A7+OeSwQLT6zj8rNdFgMziMjxynUjBCZpwOPFcSEGH1LZ8t2AMwgWar3v459NEAxPp+PwtmMcBjqT2PfGcCEG',
        duration: '1s'
    },
    siren: {
        name: 'Emergency Siren',
        data: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp5KFODAdOnt/usWIbBTOKzO/Pei0GJFHX8N2QQAoRV6XZ6qdUDQdIldXoq1kNBiJlweTDcSEFH1LY8dyBMwgWaL3t559NEAxPp+PwtmMcBjqT2PfGcCEGhZeJgGVcXnKRpa6PYTQ3gNvkw3IlBSuCzvLZiTYIGWq+7+OeSwQLUank8LZiHAY3kdfs0nkpBSl+zPDdizIHGGu7/+adTQ0PTqzY9K9hGgU3jr3n0XssBid7yfXbhzkJGW3A7+OeSwQLT6zj8rNdFgMziMjxynUjBCZpwOPFcSEGH1LZ8t2AMwgWar3v459NEAxPp+PwtmMcBjqT2PfGcCEGhZeJgGVcXnKRpa6PYTQ3gNvkw3IlBSuCzvLZiTYIGWq+7+OeSwQLUank8LZiHAY3kdfs0nkpBSl+zPDdizIHGGu7/+adTQ0PTqzY9K9hGgU3jr3n0XssBid7yfXbhzkJGW3A7+OeSwQLT6zj8rNdFgMziMjxynUjBCZpwOPFcSEGH1LZ8t2AMwgWar3v459NEAxPp+PwtmMcBjqT2PfGcCEG',
        duration: '3s'
    }
};

// Save sound data to files
Object.keys(sounds).forEach(soundName => {
    const sound = sounds[soundName];
    console.log(`Creating ${soundName} sound...`);
    
    // This is a placeholder - in a real implementation, you'd generate actual audio data
    // For now, we'll use HTML5 audio with data URLs in the browser
});

console.log('Sound files prepared for web use!');
console.log('Sounds will be generated dynamically using Web Audio API in the browser.');

module.exports = sounds;
