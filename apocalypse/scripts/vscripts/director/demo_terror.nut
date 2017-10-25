startTime <- Time()

// Tonemap
DoEntFire( "@tonemap", "SetAutoExposureMin", "0.5", 0.0, null, null )
DoEntFire( "@tonemap", "SetBloomScale", "0.4", 0.0, null, null )
DoEntFire( "@tonemap", "SetAutoExposureMax", "1.4", 0.0, null, null )

function Think()
{
	//Msg("Thinking!\n");
	//Msg( self.GetChildClass(CHILD_TYPE_COMMON) );
}

function GetMaxChilds()
{
	return 2;
}

function GetMaxChildsByType( type )
{
	if ( type == CHILD_TYPE_BOSS )
		return 0;
}