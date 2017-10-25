startTime <- Time()

// Tonemap
DoEntFire( "@tonemap", "SetAutoExposureMin", "0.5", 0.0, null, null )
DoEntFire( "@tonemap", "SetBloomScale", "0.4", 0.0, null, null )
DoEntFire( "@tonemap", "SetAutoExposureMax", "1.4", 0.0, null, null )

// Paramos el Director
self.Stop();

// El Jet pasara en 8 segundos
DoEntFire( "StartJet", "Trigger", "", 8.0, null, null )
DoEntFire( "@director", "ForceFinale", "", (10.0 * 60.0), null, null )

function Think()
{
	//Msg("Thinking!\n");
	//Msg( self.GetChildClass(CHILD_TYPE_COMMON) );
}

function GetMaxChilds()
{
	if ( self.IsStatus(STATUS_FINALE) )
		return 40;

	return 30;
}

function GetMaxChildsByType( type )
{
	if ( type == CHILD_TYPE_BOSS )
		return 0;
}

print( DirectorConfig );

