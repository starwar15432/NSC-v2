module.exports = function () {

    Room.prototype.getGuardStationFlag =
        function () {
            var guardStationFlag = _.filter(Game.flags, f => f.memory.type == 'guardStationFlag' && f.memory.room == this.name)[0];

            if (guardStationFlag) {
                return guardStationFlag;
            }
            else {
                return undefined;
            }
        };

    Room.prototype.findOtherRoomToGoTo =
        function () {
            var otherRoomFlag = _.filter(Game.flags, f => f.name.split(' ')[0] == 'otherRoomToGoTo' && f.memory.room == this.name && f.memory.numberOfCreeps > 0)[0];

            if (otherRoomFlag) {
                return otherRoomFlag;
            }
            else {
                return undefined;
            }
        };

    Room.prototype.findRoomToStealFrom =
        function () {
            var thiefFlag = _.filter(Game.flags, f => f.memory.type == 'thiefFlag' && f.memory.room == this.name && f.memory.numberOfCreeps > 0)[0];

            if (thiefFlag) {
                return thiefFlag;
            }
            else {
                return undefined;
            }
        };

    Room.prototype.getRemoteFlags =
        function () {
            var Flags = _.filter(Game.flags, f => f.name.split(' ')[0] == 'remoteFlag' && f.memory.room == this.name
            && f.memory.numberOfRemoteHarvesters != undefined && f.memory.numberOfRemoteHaulers != undefined);

            if (Flags.length > 0) {
                return Flags;
            }
            else {
                return [];
            }
        };

    Room.prototype.getRemoteGuardFlags =
        function () {
            var Flags = _.filter(Game.flags, f => f.name.split(' ')[0] == 'remoteGuardFlag' && f.memory.room == this.name
            && f.memory.numberOfGuards != undefined);

            if (Flags.length > 0) {
                return Flags;
            }
            else {
                return [];
            }
        };

    Room.prototype.getEnergyHelperFlags =
        function () {
            var Flags = _.filter(Game.flags, f => f.memory.type == 'energyHelperFlag' && f.memory.room == this.name && f.memory.numberOfCreeps != undefined);

            if (Flags.length > 0) {
                return Flags[0];
            }
            else {
                return [];
            }
        };

    Room.prototype.cacheThingsInRoom =
        function () {

            if (global[this.name] == undefined) {
                global[this.name] = {};
            }

            //hostile creeps
            global[this.name].creepsNotMine = this.find(FIND_HOSTILE_CREEPS);
            //spawns
            global[this.name].spawns = this.find(FIND_MY_SPAWNS);
            //extensions
            global[this.name].extensions = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
            //links
            global[this.name].links = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK});
            //containers
            global[this.name].containers = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
            //sources
            global[this.name].sources = this.find(FIND_SOURCES);
            //minerals
            if (!global[this.name].mineralId) {
                global[this.name].mineralId = this.find(FIND_MINERALS)[0] ? this.find(FIND_MINERALS)[0].id : undefined;
            }
            global[this.name].mineral = global[this.name].mineralId ? Game.getObjectById(global[this.name].mineralId) : undefined;

        };

    Room.prototype.createPathToController =
        function (room = this) {
        if (_.size(Game.constructionSites) > 90) return;


            _.forEach(global[room.name].sources, (source) => {
                let pathStorage = room.findPath(source.pos, room.controller.pos, {
                        ignoreCreeps: true,
                        ignoreRoads: true,
                        plainCost: 1,
                        swampCost: 1
                    }) || [];
                _.forEach(pathStorage, (pathData) => {
                    if (!pathData.lookFor(LOOK_STRUCTURES)[0]) {
                        var res = room.createConstructionSite(pathData.x, pathData.y, STRUCTURE_ROAD);
                        if (res == 0) console.log('Created Construction Site At ' + pathData.x + ' ' + pathData.y + ' ' + room.name);
                    }
                });


                _.forEach(global[room.name].spawns, (spawn) => {
                    let pathSpawn = room.findPath(source.pos, spawn.pos, {
                            ignoreCreeps: true,
                            ignoreRoads: true,
                            plainCost: 1,
                            swampCost: 1
                        }) || [];
                    _.forEach(pathSpawn, (pathData) => {
                        if (!pathData.lookFor(LOOK_STRUCTURES)[0]) {
                            var res = room.createConstructionSite(pathData.x, pathData.y, STRUCTURE_ROAD);
                            if (res == 0) console.log('Created Construction Site At ' + pathData.x + ' ' + pathData.y + ' ' + room.name);
                        }
                    });
                });

            });
        };
};