**OAUTHDB Database - CHANGE-LOG**

- For new patches use the next consecutive **patch number** from the list

**IMPORTANT: USE ONLY [PatchDBTool](https://github.com/IUNO-TDM/PatchDBTool/tree/master/PatchDBTool) to deploy Patches**

|**Patchname**                                                      |**Patch number**   |**Description**                                                                                        |**Issue Number**   | **Author**                  |
|-------------------------------------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------|-------------------|-----------------------------|
| 01_iuno_oauthdb_VinitialV_20171121.sql                    | Initial version   | Initial patch after deploying DB from Master Branch. Create Patches table.                            |  [#38][i38]       | [@gomarcel][igomarcel]      |
| iuno_oauthdb_V0001V_20171121.sql                          | 0001              | Create GetRefreshToken function  |  [#37][i37]       | [@gomarcel][igomarcel]      |
| iuno_oauthdb_V0002V_20180110.sql                          | 0002              | Fix security issue in CreateLog function  |  [#44][i44]       | [@gomarcel][igomarcel]      |
| iuno_oauthdb_V0003V_20180111.sql                          | 0003              | Correct Column name on select return value in function CreateAuthorizationCode  |  [#43][i43]       | [@gomarcel][igomarcel]      |

[i37]: https://github.com/IUNO-TDM/OAuth2Server/issues/37
[i38]: https://github.com/IUNO-TDM/OAuth2Server/issues/38
[i43]: https://github.com/IUNO-TDM/OAuth2Server/issues/43
[i44]: https://github.com/IUNO-TDM/OAuth2Server/issues/44

[igomarcel]: https://github.com/gomarcel