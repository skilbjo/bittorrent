var expect = chai.expect;

describe("BitTorrent Client", function(){
  var client;
  beforeEach(function(){
    client = new Client('http://localhost:7001');
    network = {
      trackerUrl: 'http://tracker.com',
      endpoints: {}  // endpoints can register themselves.
    };
  });
  it('reads a .torrent file', function(){
    expect(client.readTorrent(sampleTorrent)).to.deep.equal({
      "trackerUrl": "http://localhost:7000",
      "name": "file1.txt",
      "piecesSize": 16,
      "shas": ["QWTSDFD3WT643", "D6765765fyhgf55G"]
    });
  });
  it('registers with the tracker', function(){
    console.log('network.endpoints',network.endpoints);
    client.registerAsPeer(network.trackerUrl);
    console.log('network.endpoints',network.endpoints);
    expect(Object.keys(network.endpoints)).to.include(client.url());
  });
  it('gets a list of peers from a tracker', function(){
    network.endpoints['http://localhost:7002'] = '<Client>';
    network.endpoints['http://localhost:7003'] = '<Client>';
    // make sure client doesn't receive its own url back
    client.registerAsPeer(network.trackerUrl);
    expect(Object.keys(network.endpoints)).to.deep.equal(['http://localhost:7002', 'http://localhost:7003', 'http://localhost:7001'])
    expect(client.askForSeeds(network.trackerUrl)).to.deep.equal(['http://localhost:7002', 'http://localhost:7003']);
  });
  it('requests a list of available pieces in a file from a peer', function(){
    var piece1 = {sha: 'g0f86f5hkuh', data: 'afnDFaG7KJhFHFDSs'};
    var piece2 = {sha: '175ugif65fg', data: 'u7875856guyg66fhf'};
    var peer = new Client('http://localhost:7002');
    peer.registerAsPeer(network.trackerUrl);
    peer.givePiece(piece1);
    peer.givePiece(piece2);
    expect(client.askAboutAvailablePiecesFrom(peer.url())).to.deep.equal([piece1.sha, piece2.sha]);
  });
  it('requests a piece from a peer', function(){
    var peer = new Client('http://localhost:7002');
    peer.registerAsPeer(network.trackerUrl);
    var piece = {sha: '23r23ggdf', data: '132g35haff2123'};
    peer.givePiece(piece);
    expect(client.requestPiece(peer.url(), piece.sha)).to.equal(piece.data);
  });
  it('serves a piece to a requesting peer', function(){
    client.registerAsPeer(network.trackerUrl);
    var piece = {sha: 'g4hghkjs223', data: 'g43iugh34hjhkg4'};
    client.givePiece(piece);
    var peer = new Client('http://localhost:7002');
    expect(peer.requestPiece(client.url(), piece.sha)).to.equal(piece.data)
  });
  it('asks for pieces it needs', function(){

  });
  it('assembles pieces when it has them all', function(){
    var torrentShas = ['1', '2', '3'];
    var pieces = [
      {sha: '1', data: 'a'},
      {sha: '2', data: 'b'},
      {sha: '3', data: 'c'},
    ];
    pieces.forEach(function(piece){
      client.givePiece(piece);
    });
    var completeFile = client.assemblePieces(torrentShas, pieces);
    expect(completeFile).to.equal('abc');
  });
  xit('generates a new .torrent from a file');
  xit('verifies the authenticity of a piece');
  xit('notices new peers');
  xit('handles peer disconnection');
  xit('continues to seed after it has all pieces');
  xit('trades more with peers who reciprocate');
});
